<?php
class RouteProtection {
    private $conn;
    
    public function __construct($connection) {
        $this->conn = $connection;
    }

    public function validateSession() {
        if (isset($_SESSION['user_id'])) {
            // Check if session is still valid in database
            $stmt = $this->conn->prepare("SELECT active FROM users WHERE id = ?");
            $stmt->bind_param("i", $_SESSION['user_id']);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 0 || !$result->fetch_assoc()['active']) {
                $this->destroySession();
                return false;
            }
            return true;
        }
        return false;
    }

    public function destroySession() {
        session_unset();
        session_destroy();
        setcookie('PHPSESSID', '', time() - 3600, '/');
    }

    public function requireAuthentication() {
        if (!$this->validateSession()) {
            header('Content-Type: application/json');
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'redirect' => '/login.php']);
            exit();
        }
    }

    public function requireRole($allowedRoles) {
        $this->requireAuthentication();
        
        if (!in_array($_SESSION['role'], $allowedRoles)) {
            header('Content-Type: application/json');
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden', 'redirect' => $this->getRoleBasedRedirect()]);
            exit();
        }
    }

    private function getRoleBasedRedirect() {
        $redirects = [
            'student' => '/student/dashboard.php',
            'teacher' => '/teacher/dashboard.php',
            'admin' => '/admin/dashboard.php'
        ];
        
        return $redirects[$_SESSION['role']] ?? '/unauthorized.php';
    }
}
?>
