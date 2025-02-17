<?php
class Analytics {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getStats($range) {
        try {
            $interval = $this->getDateInterval($range);
            
            return [
                'userStats' => $this->getUserGrowthStats($interval),
                'activityStats' => $this->getActivityStats($interval),
                'performanceStats' => $this->getPerformanceStats($interval),
                'revenueStats' => $this->getRevenueStats($interval)
            ];
        } catch (Exception $e) {
            throw new Exception("Error getting analytics stats: " . $e->getMessage());
        }
    }

    private function getDateInterval($range) {
        switch ($range) {
            case 'week':
                return 'INTERVAL 7 DAY';
            case 'year':
                return 'INTERVAL 1 YEAR';
            default:
                return 'INTERVAL 30 DAY';
        }
    }

    private function getUserGrowthStats($interval) {
        $query = "SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as count
                 FROM users
                 WHERE created_at >= DATE_SUB(CURRENT_DATE, {$interval})
                 GROUP BY DATE(created_at)
                 ORDER BY date";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'labels' => array_column($results, 'date'),
            'data' => array_column($results, 'count')
        ];
    }

    private function getActivityStats($interval) {
        // Example query - modify based on your activity tracking
        $query = "SELECT 
                    DATE(created_at) as date,
                    COUNT(DISTINCT user_id) as active_users
                 FROM (
                    SELECT user_id, created_at FROM quiz_attempts
                    UNION ALL
                    SELECT user_id, created_at FROM tournament_registrations
                    UNION ALL
                    SELECT student_id as user_id, created_at FROM attendance
                 ) as activities
                 WHERE created_at >= DATE_SUB(CURRENT_DATE, {$interval})
                 GROUP BY DATE(created_at)
                 ORDER BY date";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'labels' => array_column($results, 'date'),
            'data' => array_column($results, 'active_users')
        ];
    }

    private function getPerformanceStats($interval) {
        return [
            'quizzes' => $this->getCount('quiz_attempts', $interval),
            'games' => 0, // Implement when game tracking is added
            'tournaments' => $this->getCount('tournament_registrations', $interval),
            'classes' => $this->getCount('attendance', $interval)
        ];
    }

    private function getRevenueStats($interval) {
        $query = "SELECT 
                    DATE(registration_date) as date,
                    SUM(t.entry_fee) as revenue
                 FROM tournament_registrations tr
                 JOIN tournaments t ON tr.tournament_id = t.id
                 WHERE tr.payment_status = 'completed'
                 AND tr.registration_date >= DATE_SUB(CURRENT_DATE, {$interval})
                 GROUP BY DATE(registration_date)
                 ORDER BY date";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'labels' => array_column($results, 'date'),
            'data' => array_column($results, 'revenue')
        ];
    }

    private function getCount($table, $interval) {
        $query = "SELECT COUNT(*) as count 
                 FROM {$table} 
                 WHERE created_at >= DATE_SUB(CURRENT_DATE, {$interval})";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }
}
?>
