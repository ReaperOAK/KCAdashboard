<?php
class Notification {
    private $conn;
    private $table_name = "notifications";

    public $id;
    public $user_id;
    public $title;
    public $message;
    public $type;
    public $is_read;
    public $created_at;
    public $category;
    public $link;
    public $email_sent;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                (user_id, title, message, type, category, link, email_sent)
                VALUES (:user_id, :title, :message, :type, :category, :link, :email_sent)";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":message", $this->message);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":category", $this->category);
        $stmt->bindParam(":link", $this->link);
        $stmt->bindParam(":email_sent", $this->email_sent);

        return $stmt->execute();
    }

    public function getUserNotifications($user_id) {
        $query = "SELECT * FROM " . $this->table_name . "
                 WHERE user_id = :user_id
                 ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markAsRead($id, $user_id) {
        $query = "UPDATE " . $this->table_name . "
                 SET is_read = true
                 WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $user_id);

        return $stmt->execute();
    }

    public function getUnreadCount($user_id) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . "
                 WHERE user_id = :user_id AND is_read = false";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'];
    }

    public function markAllAsRead($user_id) {
        $query = "UPDATE " . $this->table_name . "
                 SET is_read = true
                 WHERE user_id = :user_id AND is_read = false";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);

        return $stmt->execute();
    }

    public function getUserNotificationsByCategory($user_id, $category) {
        $query = "SELECT * FROM " . $this->table_name . "
                 WHERE user_id = :user_id AND category = :category
                 ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->bindParam(":category", $category);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function sendBulkNotification($user_ids, $title, $message, $type, $category = 'general', $link = null) {
        $successful = 0;
        $failed = 0;

        foreach ($user_ids as $user_id) {
            $this->user_id = $user_id;
            $this->title = $title;
            $this->message = $message;
            $this->type = $type;
            $this->category = $category;
            $this->link = $link;
            $this->email_sent = false;

            if ($this->create()) {
                $successful++;
            } else {
                $failed++;
            }
        }

        return [
            'successful' => $successful,
            'failed' => $failed
        ];
    }

    public function getNotificationById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function deleteNotification($id, $user_id) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $user_id);
        
        return $stmt->execute();
    }

    public function getAllCategories() {
        $query = "SELECT DISTINCT category FROM " . $this->table_name . " ORDER BY category";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
}
?>
