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
                    (email, password, role, full_name, google_id, profile_picture, status, is_active)
                    VALUES
                    (:email, :password, :role, :full_name, :google_id, :profile_picture, :status, :is_active)";

            $stmt = $this->conn->prepare($query);

            // Sanitize inputs
            $this->email = htmlspecialchars(strip_tags($this->email));
            $this->role = htmlspecialchars(strip_tags($this->role));
            $this->full_name = htmlspecialchars(strip_tags($this->full_name));

            // Set default status and is_active for new users
            $status = 'inactive';
            $is_active = 0;

            // Bind values
            $stmt->bindParam(":email", $this->email);
            $stmt->bindParam(":password", $this->password);
            $stmt->bindParam(":role", $this->role);
            $stmt->bindParam(":full_name", $this->full_name);
            $stmt->bindParam(":google_id", $this->google_id);
            $stmt->bindParam(":profile_picture", $this->profile_picture);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);

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
        
        // Load session configuration
        $sessionConfig = include '../config/session-config.php';
        
        // Get user role for session lifetime
        $roleQuery = "SELECT role FROM " . $this->table_name . " WHERE id = :user_id";
        $roleStmt = $this->conn->prepare($roleQuery);
        $roleStmt->bindParam(':user_id', $this->id);
        $roleStmt->execute();
        $userRole = $roleStmt->fetch(PDO::FETCH_ASSOC)['role'] ?? 'student';
        
        // Calculate expiration based on role
        $lifetimeHours = $sessionConfig['role_settings'][$userRole]['session_lifetime_hours'] ?? 
                        $sessionConfig['session_lifetime_hours'];
        
        $expires = date('Y-m-d H:i:s', strtotime("+{$lifetimeHours} hours"));

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
            $is_active = ($status === 'active') ? 1 : 0;
            $query = "UPDATE " . $this->table_name . "
                     SET status = :status, is_active = :is_active
                     WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":is_active", $is_active, PDO::PARAM_INT);
            $stmt->bindParam(":id", $userId);

            if ($stmt->execute()) {
                return true;
            }
            return false;
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
                         email = :email
                     WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            
            // Bind parameters
            $stmt->bindParam(':full_name', $userData['full_name']);
            $stmt->bindParam(':email', $userData['email']);
            $stmt->bindParam(':id', $userData['id']);

            if ($stmt->execute()) {
                return true;
            }
            return false;
        } catch (PDOException $e) {
            error_log("Database error in updateUser: " . $e->getMessage());
            throw new Exception("Error updating user profile");
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

    public function getAllUserIds() {
        $query = "SELECT id FROM " . $this->table_name . "
                 WHERE is_active = 1
                 ORDER BY id";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    public function getUserIdsByRole($role) {
        $query = "SELECT id FROM " . $this->table_name . "
                 WHERE role = :role AND is_active = 1
                 ORDER BY id";
                 
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":role", $role);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
?>
