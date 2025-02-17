<?php
class Attendance {
    private $conn;
    private $table_name = "attendance";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAttendanceData($batch_id = null) {
        try {
            $query = "SELECT 
                        b.name as batch_name,
                        bs.date_time as session_date,
                        COUNT(DISTINCT s.id) as total_students,
                        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(DISTINCT s.id)) as attendance_percentage
                     FROM batch_sessions bs
                     JOIN batches b ON bs.batch_id = b.id
                     JOIN batch_students s ON b.id = s.batch_id
                     LEFT JOIN attendance a ON bs.id = a.session_id AND s.student_id = a.student_id
                     WHERE bs.date_time >= CURDATE() - INTERVAL 30 DAY";

            if ($batch_id) {
                $query .= " AND b.id = :batch_id";
            }

            $query .= " GROUP BY bs.id
                       ORDER BY bs.date_time DESC";

            $stmt = $this->conn->prepare($query);
            
            if ($batch_id) {
                $stmt->bindParam(":batch_id", $batch_id);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            throw new Exception("Error fetching attendance data: " . $e->getMessage());
        }
    }
}
?>
