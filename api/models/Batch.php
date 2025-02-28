<?php
class Batch {
    private $conn;
    private $table_name = "batches";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllBatches() {
        try {
            $query = "SELECT b.*, 
                     u.full_name as teacher_name,
                     COUNT(bs.student_id) as student_count
                     FROM " . $this->table_name . " b
                     LEFT JOIN users u ON b.teacher_id = u.id
                     LEFT JOIN batch_students bs ON b.id = bs.batch_id
                     WHERE b.status != 'completed'
                     GROUP BY b.id
                     ORDER BY b.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (PDOException $e) {
            throw new Exception("Error fetching batches: " . $e->getMessage());
        }
    }

    public function getAllByTeacher($teacherId) {
        try {
            $query = "SELECT b.*, 
                     COUNT(bs.student_id) as student_count
                     FROM " . $this->table_name . " b
                     LEFT JOIN batch_students bs ON b.id = bs.batch_id
                     WHERE b.teacher_id = :teacher_id
                     GROUP BY b.id
                     ORDER BY b.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':teacher_id', $teacherId);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching teacher's batches: " . $e->getMessage());
        }
    }

    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (name, description, level, schedule, max_students, teacher_id)
                    VALUES (:name, :description, :level, :schedule, :max_students, :teacher_id)";

            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':name', $this->name);
            $stmt->bindParam(':description', $this->description);
            $stmt->bindParam(':level', $this->level);
            $stmt->bindParam(':schedule', $this->schedule);
            $stmt->bindParam(':max_students', $this->max_students);
            $stmt->bindParam(':teacher_id', $this->teacher_id);

            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error creating batch: " . $e->getMessage());
        }
    }

    public function getDetails($id, $teacherId = null) {
        try {
            $query = "SELECT b.*, 
                     u.full_name as teacher_name,
                     COUNT(bs.student_id) as student_count
                     FROM " . $this->table_name . " b
                     LEFT JOIN users u ON b.teacher_id = u.id
                     LEFT JOIN batch_students bs ON b.id = bs.batch_id
                     WHERE b.id = :id " . 
                     ($teacherId ? "AND b.teacher_id = :teacher_id " : "") .
                     "GROUP BY b.id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            if ($teacherId) {
                $stmt->bindParam(':teacher_id', $teacherId);
            }
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching batch details: " . $e->getMessage());
        }
    }

    public function update($id) {
        try {
            $query = "UPDATE " . $this->table_name . "
                    SET name = :name,
                        description = :description,
                        level = :level,
                        schedule = :schedule,
                        max_students = :max_students,
                        status = :status
                    WHERE id = :id AND teacher_id = :teacher_id";

            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':name', $this->name);
            $stmt->bindParam(':description', $this->description);
            $stmt->bindParam(':level', $this->level);
            $stmt->bindParam(':schedule', $this->schedule);
            $stmt->bindParam(':max_students', $this->max_students);
            $stmt->bindParam(':status', $this->status);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':teacher_id', $this->teacher_id);

            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error updating batch: " . $e->getMessage());
        }
    }

    public function delete($id, $teacherId) {
        try {
            // First check if the batch belongs to the teacher
            $query = "SELECT id FROM " . $this->table_name . " 
                     WHERE id = :id AND teacher_id = :teacher_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':teacher_id', $teacherId);
            $stmt->execute();
            
            if (!$stmt->fetch()) {
                throw new Exception("Batch not found or unauthorized");
            }

            // Delete batch_students entries first
            $query = "DELETE FROM batch_students WHERE batch_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            // Then delete the batch
            $query = "DELETE FROM " . $this->table_name . " 
                     WHERE id = :id AND teacher_id = :teacher_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':teacher_id', $teacherId);
            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error deleting batch: " . $e->getMessage());
        }
    }

    public function getStudents($batchId, $teacherId) {
        try {
            $query = "SELECT u.id, u.full_name, u.email, bs.joined_at, bs.status
                     FROM users u
                     JOIN batch_students bs ON u.id = bs.student_id
                     JOIN " . $this->table_name . " b ON bs.batch_id = b.id
                     WHERE b.id = :batch_id AND b.teacher_id = :teacher_id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->bindParam(':teacher_id', $teacherId);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching batch students: " . $e->getMessage());
        }
    }
}
?>
