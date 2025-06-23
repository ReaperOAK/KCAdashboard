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
    }    public function create() {
        try {
            // Start transaction to ensure both batch and classroom are created together
            $this->conn->beginTransaction();
            
            // Create the batch
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

            if (!$stmt->execute()) {
                throw new Exception("Failed to create batch");
            }
            
            // Get the newly created batch ID
            $batch_id = $this->conn->lastInsertId();
            
            // Create corresponding classroom (classrooms table doesn't have level column)
            $classroom_query = "INSERT INTO classrooms 
                              (name, description, schedule, teacher_id, status, created_at)
                              VALUES (:name, :description, :schedule, :teacher_id, 'active', NOW())";
            
            $classroom_stmt = $this->conn->prepare($classroom_query);
            $classroom_stmt->bindParam(':name', $this->name);
            $classroom_stmt->bindParam(':description', $this->description);
            $classroom_stmt->bindParam(':schedule', $this->schedule);
            $classroom_stmt->bindParam(':teacher_id', $this->teacher_id);
            
            if (!$classroom_stmt->execute()) {
                throw new Exception("Failed to create corresponding classroom");
            }
            
            // Commit transaction
            $this->conn->commit();
            return true;
            
        } catch (PDOException $e) {
            // Rollback transaction on error
            if ($this->conn->inTransaction()) {
                $this->conn->rollback();
            }
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
    }    public function update($id) {
        try {
            // Start transaction to ensure both batch and classroom are updated together
            $this->conn->beginTransaction();
            
            // Update the batch
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

            if (!$stmt->execute()) {
                throw new Exception("Failed to update batch");
            }
              // Update corresponding classroom (classrooms table doesn't have level column)
            $classroom_query = "UPDATE classrooms 
                              SET name = :name,
                                  description = :description,
                                  schedule = :schedule,
                                  status = :status
                              WHERE teacher_id = :teacher_id 
                              AND (name = :old_name OR id = :id)";
            
            // We need to get the old name first
            $old_name_query = "SELECT name FROM " . $this->table_name . " WHERE id = :id";
            $old_name_stmt = $this->conn->prepare($old_name_query);
            $old_name_stmt->bindParam(':id', $id);
            $old_name_stmt->execute();
            $old_batch = $old_name_stmt->fetch(PDO::FETCH_ASSOC);
            
            $classroom_stmt = $this->conn->prepare($classroom_query);
            $classroom_stmt->bindParam(':name', $this->name);
            $classroom_stmt->bindParam(':description', $this->description);
            $classroom_stmt->bindParam(':schedule', $this->schedule);
            $classroom_stmt->bindParam(':status', $this->status);
            $classroom_stmt->bindParam(':teacher_id', $this->teacher_id);
            $classroom_stmt->bindParam(':old_name', $old_batch['name']);
            $classroom_stmt->bindParam(':id', $id);
            
            $classroom_stmt->execute();
            
            // Commit transaction
            $this->conn->commit();
            return true;
            
        } catch (PDOException $e) {
            // Rollback transaction on error
            if ($this->conn->inTransaction()) {
                $this->conn->rollback();
            }
            throw new Exception("Error updating batch: " . $e->getMessage());
        }
    }    public function delete($id, $teacherId) {
        try {
            // Start transaction to ensure all related data is deleted together
            $this->conn->beginTransaction();
            
            // First check if the batch belongs to the teacher
            $query = "SELECT name FROM " . $this->table_name . " 
                     WHERE id = :id AND teacher_id = :teacher_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':teacher_id', $teacherId);
            $stmt->execute();
            
            $batch = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$batch) {
                throw new Exception("Batch not found or unauthorized");
            }

            // 1. Delete attendance records first (they reference batch_sessions and batches)
            $query = "DELETE FROM attendance WHERE batch_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            // 2. Delete online meeting sync logs for batch sessions
            $query = "DELETE omsl FROM online_meeting_sync_logs omsl
                     JOIN batch_sessions bs ON omsl.session_id = bs.id
                     WHERE bs.batch_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            // 3. Delete batch sessions
            $query = "DELETE FROM batch_sessions WHERE batch_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            // 4. Delete batch_students entries
            $query = "DELETE FROM batch_students WHERE batch_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();

            // 5. Delete corresponding classroom_students entries
            $classroom_query = "DELETE cs FROM classroom_students cs
                              JOIN classrooms c ON cs.classroom_id = c.id
                              WHERE c.teacher_id = :teacher_id AND c.name = :batch_name";
            $classroom_stmt = $this->conn->prepare($classroom_query);
            $classroom_stmt->bindParam(':teacher_id', $teacherId);
            $classroom_stmt->bindParam(':batch_name', $batch['name']);
            $classroom_stmt->execute();

            // 6. Delete the corresponding classroom
            $delete_classroom_query = "DELETE FROM classrooms 
                                     WHERE teacher_id = :teacher_id AND name = :batch_name";
            $delete_classroom_stmt = $this->conn->prepare($delete_classroom_query);
            $delete_classroom_stmt->bindParam(':teacher_id', $teacherId);
            $delete_classroom_stmt->bindParam(':batch_name', $batch['name']);
            $delete_classroom_stmt->execute();

            // 7. Finally delete the batch itself
            $query = "DELETE FROM " . $this->table_name . " 
                     WHERE id = :id AND teacher_id = :teacher_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->bindParam(':teacher_id', $teacherId);
            
            if (!$stmt->execute()) {
                throw new Exception("Failed to delete batch");
            }
            
            // Commit transaction
            $this->conn->commit();
            return true;
            
        } catch (PDOException $e) {
            // Rollback transaction on error
            if ($this->conn->inTransaction()) {
                $this->conn->rollback();
            }
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

    public function verifyTeacherOwnership($batchId, $teacherId) {
        try {
            $query = "SELECT id FROM " . $this->table_name . " 
                     WHERE id = :batch_id AND teacher_id = :teacher_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->bindParam(':teacher_id', $teacherId);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new Exception("Error verifying teacher ownership: " . $e->getMessage());
        }
    }
      public function addStudent($batchId, $studentId) {
        try {
            // Start transaction
            $this->conn->beginTransaction();
            
            // Check if the batch exists
            $query = "SELECT b.id, b.max_students, b.name, b.teacher_id 
                     FROM " . $this->table_name . " b WHERE b.id = :batch_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->execute();
            
            $batch = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$batch) {
                throw new Exception("Batch not found");
            }
            
            // Check if student exists with role 'student'
            $query = "SELECT id FROM users WHERE id = :student_id AND role = 'student'";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':student_id', $studentId);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                throw new Exception("Student not found or user is not a student");
            }
            
            // Check if batch is not full
            $query = "SELECT COUNT(*) AS student_count FROM batch_students WHERE batch_id = :batch_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result['student_count'] >= $batch['max_students']) {
                throw new Exception("Batch is already full");
            }
            
            // Check if student is already in the batch
            $query = "SELECT * FROM batch_students 
                     WHERE batch_id = :batch_id AND student_id = :student_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->bindParam(':student_id', $studentId);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                throw new Exception("Student is already in this batch");
            }            // Add the student to the batch (including status column with default value)
            $query = "INSERT INTO batch_students (batch_id, student_id, joined_at, status) 
                     VALUES (:batch_id, :student_id, NOW(), 'active')";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->bindParam(':student_id', $studentId);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to add student to batch");
            }
            
            // Find and add student to ALL corresponding classrooms for this teacher
            // First, try to find classroom with exact same name
            $classroom_query = "SELECT id FROM classrooms 
                              WHERE teacher_id = :teacher_id AND name = :batch_name
                              LIMIT 1";
            $classroom_stmt = $this->conn->prepare($classroom_query);
            $classroom_stmt->bindParam(':teacher_id', $batch['teacher_id']);
            $classroom_stmt->bindParam(':batch_name', $batch['name']);
            $classroom_stmt->execute();
            
            $classroom_id = null;
            if ($classroom_stmt->rowCount() > 0) {
                $classroom = $classroom_stmt->fetch(PDO::FETCH_ASSOC);
                $classroom_id = $classroom['id'];
            } else {
                // If no exact match, try to find any classroom by this teacher that looks similar
                // or create one with the same name as the batch
                $create_classroom_query = "INSERT INTO classrooms (name, description, teacher_id, status, created_at)
                                         VALUES (:name, :description, :teacher_id, 'active', NOW())";
                $create_stmt = $this->conn->prepare($create_classroom_query);
                $create_stmt->bindParam(':name', $batch['name']);
                $create_stmt->bindParam(':description', $batch['name'] . ' - Auto-created from batch');
                $create_stmt->bindParam(':teacher_id', $batch['teacher_id']);
                
                if ($create_stmt->execute()) {
                    $classroom_id = $this->conn->lastInsertId();
                }
            }
            
            // Add student to classroom if we found or created one
            if ($classroom_id) {
                // Check if student is already in the classroom
                $check_classroom_query = "SELECT id FROM classroom_students 
                                        WHERE classroom_id = :classroom_id AND student_id = :student_id";
                $check_classroom_stmt = $this->conn->prepare($check_classroom_query);
                $check_classroom_stmt->bindParam(':classroom_id', $classroom_id);
                $check_classroom_stmt->bindParam(':student_id', $studentId);
                $check_classroom_stmt->execute();
                
                if ($check_classroom_stmt->rowCount() == 0) {
                    // Add to classroom
                    $add_to_classroom_query = "INSERT INTO classroom_students (classroom_id, student_id, joined_at)
                                             VALUES (:classroom_id, :student_id, NOW())";
                    $add_to_classroom_stmt = $this->conn->prepare($add_to_classroom_query);
                    $add_to_classroom_stmt->bindParam(':classroom_id', $classroom_id);
                    $add_to_classroom_stmt->bindParam(':student_id', $studentId);
                    $add_to_classroom_stmt->execute();
                }
            }
            
            // Commit transaction
            $this->conn->commit();
            return true;
            
        } catch (PDOException $e) {
            // Rollback on error
            if ($this->conn->inTransaction()) {
                $this->conn->rollback();
            }
            throw new Exception("Database error: " . $e->getMessage());
        }
    }    public function removeStudent($batchId, $studentId) {
        try {
            // Start transaction
            $this->conn->beginTransaction();
            
            // Get batch info
            $query = "SELECT b.name, b.teacher_id FROM " . $this->table_name . " b WHERE b.id = :batch_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->execute();
            
            $batch = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$batch) {
                throw new Exception("Batch not found");
            }
            
            // Check if the student is in the batch
            $query = "SELECT * FROM batch_students 
                     WHERE batch_id = :batch_id AND student_id = :student_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->bindParam(':student_id', $studentId);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                throw new Exception("Student is not in this batch");
            }
              // Remove the student from the batch
            $query = "DELETE FROM batch_students 
                     WHERE batch_id = :batch_id AND student_id = :student_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->bindParam(':student_id', $studentId);
            
            if(!$stmt->execute()) {
                throw new Exception("Failed to remove student from batch");
            }
            
            // Find and remove from corresponding classroom(s)
            // First, try to find classroom with exact same name
            $find_classroom_query = "SELECT id FROM classrooms 
                                   WHERE teacher_id = :teacher_id AND name = :batch_name";
            $find_classroom_stmt = $this->conn->prepare($find_classroom_query);
            $find_classroom_stmt->bindParam(':teacher_id', $batch['teacher_id']);
            $find_classroom_stmt->bindParam(':batch_name', $batch['name']);
            $find_classroom_stmt->execute();
            
            // Remove from all matching classrooms
            while ($classroom = $find_classroom_stmt->fetch(PDO::FETCH_ASSOC)) {
                $remove_classroom_query = "DELETE FROM classroom_students 
                                         WHERE classroom_id = :classroom_id AND student_id = :student_id";
                $remove_classroom_stmt = $this->conn->prepare($remove_classroom_query);
                $remove_classroom_stmt->bindParam(':classroom_id', $classroom['id']);
                $remove_classroom_stmt->bindParam(':student_id', $studentId);
                $remove_classroom_stmt->execute();
            }
            
            // Also remove related attendance records
            $query = "DELETE FROM attendance 
                     WHERE batch_id = :batch_id AND student_id = :student_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':batch_id', $batchId);
            $stmt->bindParam(':student_id', $studentId);
            $stmt->execute();
            
            // Commit transaction
            $this->conn->commit();
            return true;
            
        } catch (PDOException $e) {
            // Rollback on error
            if ($this->conn->inTransaction()) {
                $this->conn->rollback();
            }
            throw new Exception("Database error: " . $e->getMessage());
        }
    }
}
?>
