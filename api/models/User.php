<?php
class User {
    private $conn;
    private $table_name = "users";
    
    // Properties
    public $id;
    public $email;
    public $password;
    public $role;
    public $full_name;
    public $google_id;
    public $profile_picture;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        try {
            $query = "INSERT INTO " . $this->table_name . "
                    (email, password, role, full_name, google_id, profile_picture)
                    VALUES
                    (:email, :password, :role, :full_name, :google_id, :profile_picture)";

            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->role = htmlspecialchars(strip_tags($this->role));
            $this->full_name = htmlspecialchars(strip_tags($this->full_name));

            // Bind values
            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":password", $this->password);
            $stmt->bindParam(":role", $this->role);
            $stmt->bindParam(":full_name", $this->full_name);
            $stmt->bindParam(":google_id", $this->google_id);
            $stmt->bindParam(":profile_picture", $this->profile_picture);

            if ($stmt->execute()) {
                return true;
            }
            
            error_log("Database error: " . implode(", ", $stmt->errorInfo()));
            return false;
            
        } catch (PDOException $e) {
            error_log("Database error: " . $e->getMessage());
            throw new Exception("Database error: " . $e->getMessage());
        }
    }

    public function findByEmail($email) {
        try {
            $query = "SELECT * FROM " . $this->table_name . " WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            error_log("Searching for user with email: " . $email);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                error_log("User found: " . print_r($result, true));
            } else {
                error_log("No user found with email: " . $email);
            }
            
            return $result;
        } catch (PDOException $e) {
            error_log("Database error in findByEmail: " . $e->getMessage());
            throw new Exception("Database error finding user");
        }
    }

    public function generateAuthToken() {
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+24 hours'));

        $query = "INSERT INTO auth_tokens (user_id, token, expires_at)
                 VALUES (:user_id, :token, :expires_at)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->id);
        $stmt->bindParam(':token', $token);
        $stmt->bindParam(':expires_at', $expires);
        
        if($stmt->execute()) {
            return $token;
        }
        return false;
    }

    public function emailExists($email) {
        try {
            $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $email);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
            
        } catch (PDOException $e) {
            error_log("Database error in emailExists: " . $e->getMessage());
            throw new Exception("Database error checking email");
        }
    }

    public function getAll($filter = 'all', $search = '') {
        try {
            $query = "SELECT id, full_name, email, role, status, created_at 
                     FROM " . $this->table_name . " 
                     WHERE 1=1";

            // Add role filter
            if ($filter !== 'all') {
                $query .= " AND role = :role";
            }

            // Add search filter
            if (!empty($search)) {
                $query .= " AND (full_name LIKE :search OR email LIKE :search)";
            }

            $query .= " ORDER BY created_at DESC";

            $stmt = $this->conn->prepare($query);

            // Bind parameters
            if ($filter !== 'all') {
                $stmt->bindParam(":role", $filter);
            }
            if (!empty($search)) {
                $searchTerm = "%{$search}%";
                $stmt->bindParam(":search", $searchTerm);
            }

            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching users: " . $e->getMessage());
        }
    }

    public function updateStatus($userId, $status) {
        try {
            $query = "UPDATE " . $this->table_name . "
                     SET status = :status
                     WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":id", $userId);

            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error updating user status: " . $e->getMessage());
        }
    }

    public function updateRole($userId, $role) {
        try {
            $query = "UPDATE " . $this->table_name . "
                     SET role = :role
                     WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":role", $role);
            $stmt->bindParam(":id", $userId);

            return $stmt->execute();
        } catch (PDOException $e) {
            throw new Exception("Error updating user role: " . $e->getMessage());
        }
    }

    public function updateUser($userData) {
        try {
            $query = "UPDATE " . $this->table_name . "
                     SET full_name = :full_name,
                         email = :email,
                         role = :role,
                         status = :status
                     WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->execute($userData);

            return true;
        } catch (PDOException $e) {
            throw new Exception("Error updating user: " . $e->getMessage());
        }
    }

    public function getAllUsers($filter = 'all', $search = '') {
        try {
            $query = "SELECT id, email, full_name, role, is_active as status, created_at 
                     FROM " . $this->table_name . " 
                     WHERE 1=1";

            $params = array();

            if ($filter !== 'all') {
                $query .= " AND role = :role";
                $params[':role'] = $filter;
            }

            if (!empty($search)) {
                $query .= " AND (full_name LIKE :search OR email LIKE :search)";
                $params[':search'] = "%$search%";
            }

            $query .= " ORDER BY created_at DESC";

            $stmt = $this->conn->prepare($query);
            
            // Bind parameters
            foreach ($params as $key => &$val) {
                $stmt->bindParam($key, $val);
            }

            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Clean sensitive data
            foreach ($users as &$user) {
                unset($user['password']);
                $user['status'] = $user['status'] ? 'active' : 'inactive';
            }

            return $users;

        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            throw new Exception("Error fetching users: " . $e->getMessage());
        }
    }
}
?>
