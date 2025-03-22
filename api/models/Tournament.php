<?php
class Tournament {
    private $conn;
    private $table_name = "tournaments";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll() {
        try {
            $query = "SELECT t.*, u.full_name as organizer_name,
                     (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) as participant_count
                     FROM " . $this->table_name . " t
                     JOIN users u ON t.created_by = u.id
                     ORDER BY t.date_time ASC";

            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching tournaments: " . $e->getMessage());
        }
    }

    public function getByStatus($status) {
        try {
            $query = "SELECT t.*, u.full_name as organizer_name,
                     (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) as participant_count
                     FROM " . $this->table_name . " t
                     JOIN users u ON t.created_by = u.id
                     WHERE t.status = :status
                     ORDER BY t.date_time ASC";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":status", $status);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching tournaments by status: " . $e->getMessage());
        }
    }
    
    public function getTournamentById($id) {
        try {
            $query = "SELECT t.*, u.full_name as organizer_name,
                     (SELECT COUNT(*) FROM tournament_registrations WHERE tournament_id = t.id) as participant_count
                     FROM " . $this->table_name . " t
                     JOIN users u ON t.created_by = u.id
                     WHERE t.id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $id);
            $stmt->execute();
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching tournament: " . $e->getMessage());
        }
    }
    
    public function checkRegistration($tournament_id, $user_id) {
        try {
            $query = "SELECT * FROM tournament_registrations
                     WHERE tournament_id = :tournament_id
                     AND user_id = :user_id";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":tournament_id", $tournament_id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new Exception("Error checking registration: " . $e->getMessage());
        }
    }
    
    public function registerUser($tournament_id, $user_id) {
        try {
            // Get the entry fee to determine initial payment status
            $tournamentQuery = "SELECT entry_fee FROM tournaments WHERE id = :id";
            $tournamentStmt = $this->conn->prepare($tournamentQuery);
            $tournamentStmt->bindParam(":id", $tournament_id);
            $tournamentStmt->execute();
            $tournament = $tournamentStmt->fetch(PDO::FETCH_ASSOC);
            
            // If tournament is free, mark payment as completed
            $payment_status = ($tournament['entry_fee'] > 0) ? 'pending' : 'completed';
            
            // Register the user
            $query = "INSERT INTO tournament_registrations
                     (tournament_id, user_id, registration_date, payment_status)
                     VALUES (:tournament_id, :user_id, NOW(), :payment_status)";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":tournament_id", $tournament_id);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->bindParam(":payment_status", $payment_status);
            
            if ($stmt->execute()) {
                return true;
            }
            
            throw new Exception("Error registering for tournament");
        } catch (PDOException $e) {
            throw new Exception("Error registering for tournament: " . $e->getMessage());
        }
    }
    
    public function getUserRegistrations($user_id) {
        try {
            $query = "SELECT tr.*, t.title, t.date_time, t.entry_fee, t.status as tournament_status
                     FROM tournament_registrations tr
                     JOIN tournaments t ON tr.tournament_id = t.id
                     WHERE tr.user_id = :user_id";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $user_id);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching user registrations: " . $e->getMessage());
        }
    }
    
    public function cancelRegistration($tournament_id, $user_id) {
        try {
            // Check if tournament has started
            $checkQuery = "SELECT status FROM tournaments WHERE id = :id";
            $checkStmt = $this->conn->prepare($checkQuery);
            $checkStmt->bindParam(":id", $tournament_id);
            $checkStmt->execute();
            $tournament = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($tournament['status'] !== 'upcoming') {
                throw new Exception("Cannot cancel registration for tournaments that have already started");
            }
            
            $query = "DELETE FROM tournament_registrations
                     WHERE tournament_id = :tournament_id
                     AND user_id = :user_id";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":tournament_id", $tournament_id);
            $stmt->bindParam(":user_id", $user_id);
            
            if ($stmt->execute()) {
                return true;
            }
            
            throw new Exception("Error canceling registration");
        } catch (PDOException $e) {
            throw new Exception("Error canceling registration: " . $e->getMessage());
        }
    }
    
    public function updatePaymentStatus($tournament_id, $user_id, $status = 'completed') {
        try {
            $query = "UPDATE tournament_registrations
                     SET payment_status = :status
                     WHERE tournament_id = :tournament_id
                     AND user_id = :user_id";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":tournament_id", $tournament_id);
            $stmt->bindParam(":user_id", $user_id);
            
            if ($stmt->execute()) {
                return true;
            }
            
            throw new Exception("Error updating payment status");
        } catch (PDOException $e) {
            throw new Exception("Error updating payment status: " . $e->getMessage());
        }
    }
    
    public function getRegistrationsByTournament($tournament_id) {
        try {
            $query = "SELECT tr.*, u.full_name, u.email
                     FROM tournament_registrations tr
                     JOIN users u ON tr.user_id = u.id
                     WHERE tr.tournament_id = :tournament_id";
                     
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":tournament_id", $tournament_id);
            $stmt->execute();
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            throw new Exception("Error fetching tournament registrations: " . $e->getMessage());
        }
    }
}
?>
