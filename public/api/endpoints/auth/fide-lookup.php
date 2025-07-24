<?php
header('Content-Type: application/json');
require_once '../../config/cors.php';
require_once '../../config/Database.php';
require_once '../../middleware/auth.php';

try {
    // Verify JWT token
    $user_id = validateToken();
    
    if (!$user_id) {
        throw new Exception('Unauthorized access');
    }

    $fide_id = $_GET['fide_id'] ?? null;
    
    if (!$fide_id || !preg_match('/^[0-9]{5,10}$/', $fide_id)) {
        throw new Exception('Valid FIDE ID required');
    }

    // FIDE API endpoint (Note: This is a mock URL - replace with actual FIDE API when available)
    $fide_api_url = "https://ratings.fide.com/api/player/" . $fide_id;
    
    // Alternative: Use web scraping from FIDE website
    $fide_profile_url = "https://ratings.fide.com/profile/" . $fide_id;
    
    // Initialize cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $fide_profile_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code !== 200 || !$response) {
        throw new Exception('FIDE player not found or FIDE service unavailable');
    }
    
    // Parse HTML response to extract player data (basic implementation)
    $player_data = [
        'fide_id' => $fide_id,
        'name' => null,
        'country' => null,
        'standard_rating' => null,
        'rapid_rating' => null,
        'blitz_rating' => null,
        'title' => null,
        'birth_year' => null,
        'profile_url' => $fide_profile_url
    ];
    
    // Basic HTML parsing (you might want to use a proper HTML parser like DOMDocument)
    if (preg_match('/<h1[^>]*>([^<]+)<\/h1>/', $response, $matches)) {
        $player_data['name'] = trim($matches[1]);
    }
    
    if (preg_match('/Standard rating[^0-9]*([0-9]+)/', $response, $matches)) {
        $player_data['standard_rating'] = (int)$matches[1];
    }
    
    if (preg_match('/Rapid rating[^0-9]*([0-9]+)/', $response, $matches)) {
        $player_data['rapid_rating'] = (int)$matches[1];
    }
    
    if (preg_match('/Blitz rating[^0-9]*([0-9]+)/', $response, $matches)) {
        $player_data['blitz_rating'] = (int)$matches[1];
    }
    
    // Store/update rating in database
    $database = new Database();
    $db = $database->getConnection();
    
    if ($player_data['standard_rating']) {
        $stmt = $db->prepare("
            INSERT INTO fide_ratings_history (user_id, fide_id, rating, rating_type, recorded_date) 
            VALUES (?, ?, ?, 'standard', CURDATE())
            ON DUPLICATE KEY UPDATE rating = VALUES(rating), recorded_date = CURDATE()
        ");
        $stmt->execute([$user_id, $fide_id, $player_data['standard_rating']]);
    }
    
    echo json_encode([
        'success' => true,
        'player_data' => $player_data
    ]);

} catch (Exception $e) {
    error_log("FIDE lookup error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
