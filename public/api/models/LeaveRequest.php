<?php
// models/LeaveRequest.php


require_once __DIR__ . '/../config/Database.php';

class LeaveRequest {
    public $id;
    public $teacher_id;
    public $start_datetime;
    public $end_datetime;
    public $reason;
    public $status; // pending, approved, rejected
    public $admin_comment;
    public $created_at;
    public $updated_at;

    public static function create($teacher_id, $start_datetime, $end_datetime, $reason) {
        $db = (new Database())->getConnection();
        $stmt = $db->prepare("INSERT INTO leave_requests (teacher_id, start_datetime, end_datetime, reason) VALUES (?, ?, ?, ?)");
        $stmt->execute([$teacher_id, $start_datetime, $end_datetime, $reason]);
        return $db->lastInsertId();
    }

    public static function getByTeacher($teacher_id) {
        $db = (new Database())->getConnection();
        $stmt = $db->prepare("SELECT * FROM leave_requests WHERE teacher_id = ? ORDER BY created_at DESC");
        $stmt->execute([$teacher_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function getAll() {
        $db = (new Database())->getConnection();
        $stmt = $db->query("SELECT * FROM leave_requests ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function updateStatus($id, $status, $admin_comment = null) {
        $db = (new Database())->getConnection();
        $stmt = $db->prepare("UPDATE leave_requests SET status = ?, admin_comment = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$status, $admin_comment, $id]);
    }
}
