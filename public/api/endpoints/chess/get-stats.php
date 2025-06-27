<?php

require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

try {
    // Get query parameters
    $pgn_id = isset($_GET['pgn_id']) ? intval($_GET['pgn_id']) : null;
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    $period = isset($_GET['period']) ? $_GET['period'] : 'all'; // 'day', 'week', 'month', 'all'
    
    // Get current user
    $current_user = getAuthUser();
    
    // Connect to database
    $database = new Database();
    $db = $database->getConnection();
    
    if ($pgn_id) {
        // Get statistics for a specific PGN
        $query = "SELECT 
                    pf.id,
                    pf.title,
                    pf.category,
                    pf.view_count,
                    pf.is_public,
                    pf.teacher_id,
                    pf.created_at,
                    u.full_name as teacher_name,
                    COUNT(DISTINCT pv.user_id) as unique_viewers,
                    COUNT(pv.id) as total_views,
                    MAX(pv.viewed_at) as last_viewed,
                    COUNT(DISTINCT ps.user_id) as shared_with_count,
                    LENGTH(pf.pgn_content) as content_size_bytes,
                    JSON_EXTRACT(pf.metadata, '$.totalGames') as game_count,
                    JSON_EXTRACT(pf.metadata, '$.validGames') as valid_games,
                    JSON_EXTRACT(pf.metadata, '$.gamesWithErrors') as games_with_errors
                  FROM pgn_files pf
                  LEFT JOIN users u ON pf.teacher_id = u.id
                  LEFT JOIN pgn_views pv ON pf.id = pv.pgn_id";
        
        // Add time period filter if needed
        if ($period !== 'all') {
            $date_filter = '';
            switch ($period) {
                case 'day':
                    $date_filter = 'AND pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
                    break;
                case 'week':
                    $date_filter = 'AND pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
                    break;
                case 'month':
                    $date_filter = 'AND pv.viewed_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
                    break;
            }
            $query .= " " . $date_filter;
        }
        
        $query .= " LEFT JOIN pgn_shares ps ON pf.id = ps.pgn_id
                   WHERE pf.id = ?
                   GROUP BY pf.id";
        
        $stmt = $db->prepare($query);
        $stmt->bind_param('i', $pgn_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows === 0) {
            throw new Exception('PGN not found');
        }
        
        $stats = $result->fetch_assoc();
        
        // Convert numeric strings to integers
        $stats['id'] = (int)$stats['id'];
        $stats['view_count'] = (int)$stats['view_count'];
        $stats['unique_viewers'] = (int)$stats['unique_viewers'];
        $stats['total_views'] = (int)$stats['total_views'];
        $stats['shared_with_count'] = (int)$stats['shared_with_count'];
        $stats['content_size_bytes'] = (int)$stats['content_size_bytes'];
        $stats['content_size_kb'] = round($stats['content_size_bytes'] / 1024, 2);
        $stats['game_count'] = $stats['game_count'] ? (int)$stats['game_count'] : 0;
        $stats['valid_games'] = $stats['valid_games'] ? (int)$stats['valid_games'] : 0;
        $stats['games_with_errors'] = $stats['games_with_errors'] ? (int)$stats['games_with_errors'] : 0;
        
        // Get hourly view breakdown for the last 24 hours
        $hourly_query = "SELECT 
                           HOUR(viewed_at) as hour,
                           COUNT(*) as views
                         FROM pgn_views 
                         WHERE pgn_id = ? 
                         AND viewed_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                         GROUP BY HOUR(viewed_at)
                         ORDER BY hour";
        
        $hourly_stmt = $db->prepare($hourly_query);
        $hourly_stmt->bind_param('i', $pgn_id);
        $hourly_stmt->execute();
        $hourly_result = $hourly_stmt->get_result();
        
        $hourly_views = [];
        while ($row = $hourly_result->fetch_assoc()) {
            $hourly_views[(int)$row['hour']] = (int)$row['views'];
        }
        
        // Fill in missing hours with 0
        for ($i = 0; $i < 24; $i++) {
            if (!isset($hourly_views[$i])) {
                $hourly_views[$i] = 0;
            }
        }
        ksort($hourly_views);
        
        $stats['hourly_views'] = $hourly_views;
        
        echo json_encode([
            'success' => true,
            'data' => $stats
        ]);
        
    } else {
        // Get overall statistics
        $overview_query = "SELECT 
                             COUNT(*) as total_pgns,
                             COUNT(CASE WHEN is_public = 1 THEN 1 END) as public_pgns,
                             COUNT(CASE WHEN is_public = 0 THEN 1 END) as private_pgns,
                             SUM(view_count) as total_views,
                             AVG(view_count) as avg_views_per_pgn,
                             COUNT(CASE WHEN category = 'opening' THEN 1 END) as opening_count,
                             COUNT(CASE WHEN category = 'middlegame' THEN 1 END) as middlegame_count,
                             COUNT(CASE WHEN category = 'endgame' THEN 1 END) as endgame_count,
                             COUNT(CASE WHEN category = 'tactics' THEN 1 END) as tactics_count,
                             COUNT(CASE WHEN category = 'strategy' THEN 1 END) as strategy_count,
                             SUM(LENGTH(pgn_content)) as total_content_size
                           FROM pgn_files";
        
        if ($user_id) {
            $overview_query .= " WHERE teacher_id = ?";
            $stmt = $db->prepare($overview_query);
            $stmt->bind_param('i', $user_id);
        } else {
            $stmt = $db->prepare($overview_query);
        }
        
        $stmt->execute();
        $overview = $stmt->get_result()->fetch_assoc();
        
        // Convert to proper types
        foreach ($overview as $key => $value) {
            if (is_numeric($value)) {
                $overview[$key] = $key === 'avg_views_per_pgn' ? round((float)$value, 2) : (int)$value;
            }
        }
        
        $overview['total_content_size_mb'] = round($overview['total_content_size'] / 1024 / 1024, 2);
        
        // Get top viewed PGNs
        $top_query = "SELECT id, title, view_count, category 
                      FROM pgn_files 
                      ORDER BY view_count DESC 
                      LIMIT 10";
        
        $top_result = $db->query($top_query);
        $top_pgns = [];
        while ($row = $top_result->fetch_assoc()) {
            $row['id'] = (int)$row['id'];
            $row['view_count'] = (int)$row['view_count'];
            $top_pgns[] = $row;
        }
        
        // Get recent uploads
        $recent_query = "SELECT id, title, category, created_at, view_count
                         FROM pgn_files 
                         ORDER BY created_at DESC 
                         LIMIT 5";
        
        $recent_result = $db->query($recent_query);
        $recent_pgns = [];
        while ($row = $recent_result->fetch_assoc()) {
            $row['id'] = (int)$row['id'];
            $row['view_count'] = (int)$row['view_count'];
            $recent_pgns[] = $row;
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'overview' => $overview,
                'top_pgns' => $top_pgns,
                'recent_pgns' => $recent_pgns,
                'period' => $period
            ]
        ]);
    }
    
} catch (Exception $e) {
    error_log("Error fetching PGN statistics: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch statistics: ' . $e->getMessage(),
        'error_code' => 'STATS_FETCH_FAILED'
    ]);
}
?>
