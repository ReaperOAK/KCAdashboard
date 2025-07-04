<?php
// models/LeaveRequest.php

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
        // Insert into DB (pseudo code)
        // ...
    }

    public static function getByTeacher($teacher_id) {
        // Fetch from DB
        // ...
    }

    public static function getAll() {
        // Fetch all leave requests (for admin)
        // ...
    }

    public static function updateStatus($id, $status, $admin_comment = null) {
        // Update status in DB
        // ...
    }
}
