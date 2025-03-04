<?php
class PGN {
    private $conn;
    private $table_name = "pgn_files";
    private $shares_table = "pgn_shares";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getTeacherPGNs($teacher_id) {
        try {
            $query = "SELECT p.*, 
                      (SELECT COUNT(*) FROM " . $this->shares_table . " WHERE pgn_id = p.id) as share_count
                      FROM " . $this->table_name . " p
                      WHERE p.teacher_id = :teacher_id 
                      ORDER BY p.created_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":teacher_id", $teacher_id);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching PGNs: " . $e->getMessage());
        }
    }

    public function getSharedWithMe($teacher_id) {
        try {
            $query = "SELECT p.*, u.full_name as shared_by, s.permission, s.shared_at
                      FROM " . $this->table_name . " p
                      JOIN " . $this->shares_table . " s ON p.id = s.pgn_id
                      JOIN users u ON p.teacher_id = u.id
                      WHERE s.user_id = :teacher_id
                      ORDER BY s.shared_at DESC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":teacher_id", $teacher_id);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching shared PGNs: " . $e->getMessage());
        }
    }

    public function getPublicPGNs($category = null, $teacher_id = null) {
        try {
            $query = "SELECT p.*, u.full_name as teacher_name
                      FROM " . $this->table_name . " p
                      JOIN users u ON p.teacher_id = u.id
                      WHERE p.is_public = 1";
            
            $params = [];
            
            // Add category filter if provided
            if ($category) {
                $query .= " AND p.category = :category";
                $params[':category'] = $category;
            }
            
            // Add teacher filter if provided
            if ($teacher_id) {
                $query .= " AND p.teacher_id = :teacher_id";
                $params[':teacher_id'] = $teacher_id;
            }
            
            $query .= " ORDER BY p.created_at DESC";

            $stmt = $this->conn->prepare($query);
            
            // Bind parameters if any
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching public PGNs: " . $e->getMessage());
        }
    }

    public function upload($data) {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (title, description, category, pgn_content, file_path, is_public, teacher_id)
                    VALUES (:title, :description, :category, :pgn_content, :file_path, :is_public, :teacher_id)";

            $stmt = $this->conn->prepare($query);
            $stmt->execute($data);
            return $this->conn->lastInsertId();
        } catch (PDOException $e) {
            throw new Exception("Error uploading PGN: " . $e->getMessage());
        }
    }

    public function getPGNById($id, $user_id) {
        try {
            $query = "SELECT p.*, 
                     (p.teacher_id = :user_id OR EXISTS (
                         SELECT 1 FROM " . $this->shares_table . " 
                         WHERE pgn_id = p.id AND user_id = :user_id
                     )) as has_access,
                     (SELECT permission FROM " . $this->shares_table . " 
                      WHERE pgn_id = p.id AND user_id = :user_id) as permission
                     FROM " . $this->table_name . " p
                     WHERE p.id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching PGN: " . $e->getMessage());
        }
    }

    public function update($id, $data) {
        try {
            $fields = [];
            foreach ($data as $key => $value) {
                if ($key != 'id') {
                    $fields[] = "$key = :$key";
                }
            }
            
            $query = "UPDATE " . $this->table_name . " 
                     SET " . implode(", ", $fields) . "
                     WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            $data['id'] = $id;
            $stmt->execute($data);
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new Exception("Error updating PGN: " . $e->getMessage());
        }
    }

    public function delete($id) {
        try {
            // Delete shares first to maintain referential integrity
            $query = "DELETE FROM " . $this->shares_table . " WHERE pgn_id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            
            // Then delete the PGN
            $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new Exception("Error deleting PGN: " . $e->getMessage());
        }
    }

    public function sharePGN($pgn_id, $user_ids, $permission = 'view') {
        try {
            $this->conn->beginTransaction();
            
            // First, delete any existing shares for these users and PGN
            $query = "DELETE FROM " . $this->shares_table . " 
                     WHERE pgn_id = :pgn_id AND user_id IN (" . implode(',', array_fill(0, count($user_ids), '?')) . ")";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":pgn_id", $pgn_id);
            
            // Bind each user_id to a placeholder
            foreach ($user_ids as $index => $user_id) {
                $stmt->bindValue($index + 1, $user_id);
            }
            $stmt->execute();
            
            // Now insert new shares
            $query = "INSERT INTO " . $this->shares_table . " 
                     (pgn_id, user_id, permission) VALUES (:pgn_id, :user_id, :permission)";
            
            $stmt = $this->conn->prepare($query);
            
            foreach ($user_ids as $user_id) {
                $stmt->bindParam(":pgn_id", $pgn_id);
                $stmt->bindParam(":user_id", $user_id);
                $stmt->bindParam(":permission", $permission);
                $stmt->execute();
            }
            
            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            throw new Exception("Error sharing PGN: " . $e->getMessage());
        }
    }

    public function getShareUsers($pgn_id) {
        try {
            $query = "SELECT s.*, u.full_name, u.email 
                     FROM " . $this->shares_table . " s
                     JOIN users u ON s.user_id = u.id
                     WHERE s.pgn_id = :pgn_id
                     ORDER BY s.shared_at DESC";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":pgn_id", $pgn_id);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching share users: " . $e->getMessage());
        }
    }

    public function removeShare($pgn_id, $user_id) {
        try {
            $query = "DELETE FROM " . $this->shares_table . " 
                     WHERE pgn_id = :pgn_id AND user_id = :user_id";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":pgn_id", $pgn_id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new Exception("Error removing share: " . $e->getMessage());
        }
    }
    
    public function validatePGN($pgn_content) {
        // Basic validation - check if it contains the required PGN tags
        if (!preg_match('/\[\s*Event\s*"[^"]*"\s*\]/', $pgn_content) || 
            !preg_match('/\[\s*Date\s*"[^"]*"\s*\]/', $pgn_content) || 
            !preg_match('/\[\s*White\s*"[^"]*"\s*\]/', $pgn_content) || 
            !preg_match('/\[\s*Black\s*"[^"]*"\s*\]/', $pgn_content)) {
            
            return ['valid' => false, 'message' => 'PGN is missing required tags (Event, Date, White, Black)'];
        }
        
        // Check for invalid characters or potentially harmful content
        if (preg_match('/<script|<img|<iframe|javascript:|onerror=|onload=/i', $pgn_content)) {
            return ['valid' => false, 'message' => 'PGN contains potentially harmful content'];
        }

        // Basic structure validation - looks for moves section
        if (!preg_match('/1\.\s*[a-zA-Z0-9]+/', $pgn_content)) {
            return ['valid' => false, 'message' => 'PGN does not contain valid moves'];
        }
        
        return ['valid' => true];
    }
}
?>
