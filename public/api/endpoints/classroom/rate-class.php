<?php
// Endpoint: POST /api/endpoints/classroom/rate-class.php
require_once __DIR__ . '/../../models/ClassRating.php';
require_once __DIR__ . '/../../models/Attendance.php';
require_once __DIR__ . '/../../models/Classroom.php';
require_once __DIR__ . '/../../utils/api_response.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$class_id = $data['class_id'] ?? null;
$student_id = $data['student_id'] ?? null;
$rating = $data['rating'] ?? null;
$comment = $data['comment'] ?? null;

if (!$class_id || !$student_id || !$rating) {
    api_response(['error' => 'Missing required fields'], 400);
}

// Check if student attended and class ended
if (!ClassRating::canRate($class_id, $student_id)) {
    api_response(['error' => 'You are not eligible to rate this class.'], 403);
}

// Save rating
ClassRating::create($class_id, $student_id, $rating, $comment);
api_response(['success' => true]);
