<?php
require_once('../config.php');
header('Content-Type: application/json');

try {
    $stats = array();
    
    // Get pending tickets count
    $pending_query = "SELECT COUNT(*) as pending FROM support_tickets WHERE status = 'Pending'";
    $pending_result = $conn->query($pending_query);
    $pending_row = $pending_result->fetch_assoc();
    $stats['pending'] = (int)$pending_row['pending'];
    
    // Get resolved tickets count
    $resolved_query = "SELECT COUNT(*) as resolved FROM support_tickets WHERE status = 'Resolved'";
    $resolved_result = $conn->query($resolved_query);
    $resolved_row = $resolved_result->fetch_assoc();
    $stats['resolved'] = (int)$resolved_row['resolved'];
    
    // Calculate total
    $stats['total'] = $stats['pending'] + $stats['resolved'];
    
    echo json_encode(['success' => true, 'data' => $stats]);
} catch(Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

$conn->close();
?>
