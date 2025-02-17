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
                        bss.date_time as session_date,
                        COUNT(DISTINCT bst.student_id) as total_students,
                        COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
                        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(DISTINCT bst.student_id)) as attendance_percentage
                     FROM batch_sessions bss
                     JOIN batches b ON bss.batch_id = b.id
                     JOIN batch_students bst ON b.id = bst.batch_id
                     LEFT JOIN attendance a ON bss.id = a.session_id 
                        AND bst.student_id = a.student_id
                     WHERE bss.date_time >= CURDATE() - INTERVAL 30 DAY";

            if ($batch_id) {
                $query .= " AND b.id = :batch_id";
            }

            $query .= " GROUP BY bss.id, b.name, bss.date_time
                       ORDER BY bss.date_time DESC";

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

    public function getSettings() {
        try {
            $query = "SELECT * FROM attendance_settings ORDER BY id DESC LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching attendance settings: " . $e->getMessage());
        }
    }

    public function updateSettings($settings) {
        try {
            $query = "INSERT INTO attendance_settings
                    (min_attendance_percent, late_threshold_minutes, 
                     auto_mark_absent_after_minutes, reminder_before_minutes)
                    VALUES 
                    (:min_percent, :late_threshold, :auto_absent, :reminder)";

            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                ':min_percent' => $settings['minAttendancePercent'],
                ':late_threshold' => $settings['lateThreshold'],
                ':auto_absent' => $settings['autoMarkAbsent'],
                ':reminder' => $settings['reminderBefore']
            ]);
            return true;
        } catch (PDOException $e) {
            throw new Exception("Error updating attendance settings: " . $e->getMessage());
        }
    }
}
?>
