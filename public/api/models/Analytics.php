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
        $query = "SELECT 
                    activity_date as date,
                    COUNT(DISTINCT user_id) as active_users
                 FROM (
                    SELECT user_id, completed_at as activity_date 
                    FROM quiz_attempts
                    WHERE completed_at >= DATE_SUB(CURRENT_DATE, {$interval})
                    
                    UNION ALL
                    
                    SELECT user_id, registration_date as activity_date 
                    FROM tournament_registrations
                    WHERE registration_date >= DATE_SUB(CURRENT_DATE, {$interval})
                    
                    UNION ALL
                    
                    SELECT student_id as user_id, updated_at as activity_date 
                    FROM attendance
                    WHERE updated_at >= DATE_SUB(CURRENT_DATE, {$interval})
                 ) as activities
                 GROUP BY activity_date
                 ORDER BY activity_date";

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
            'quizzes' => $this->getQuizCount($interval),
            'games' => 0, // Implement when game tracking is added
            'tournaments' => $this->getTournamentCount($interval),
            'classes' => $this->getAttendanceCount($interval)
        ];
    }

    private function getQuizCount($interval) {
        $query = "SELECT COUNT(*) as count 
                 FROM quiz_attempts 
                 WHERE completed_at >= DATE_SUB(CURRENT_DATE, {$interval})";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    private function getTournamentCount($interval) {
        $query = "SELECT COUNT(*) as count 
                 FROM tournament_registrations 
                 WHERE registration_date >= DATE_SUB(CURRENT_DATE, {$interval})";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    private function getAttendanceCount($interval) {
        $query = "SELECT COUNT(*) as count 
                 FROM attendance 
                 WHERE updated_at >= DATE_SUB(CURRENT_DATE, {$interval})";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    private function getRevenueStats($interval) {
        $query = "SELECT 
                    DATE(tr.registration_date) as date,
                    SUM(t.entry_fee) as revenue
                 FROM tournament_registrations tr
                 JOIN tournaments t ON tr.tournament_id = t.id
                 WHERE tr.payment_status = 'completed'
                 AND tr.registration_date >= DATE_SUB(CURRENT_DATE, {$interval})
                 GROUP BY DATE(tr.registration_date)
                 ORDER BY date";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'labels' => array_column($results, 'date'),
            'data' => array_column($results, 'revenue')
        ];
    }
}
?>
