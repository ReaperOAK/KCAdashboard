<?php
// Helper function to export attendance to PDF
function exportAttendance($db, $pdf, $teacher_id, $filters) {
    // Add a title
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Cell(0, 10, 'Attendance Report', 0, 1, 'C');
    
    // Add filter information
    $pdf->SetFont('helvetica', 'I', 9);
    $filterText = 'Filters: ';
    if (!empty($filters['batch_id'])) {
        $stmt = $db->prepare("SELECT name FROM batches WHERE id = ?");
        $stmt->execute([$filters['batch_id']]);
        $batchName = $stmt->fetchColumn() ?: 'Unknown';
        $filterText .= "Batch: " . $batchName . ", ";
    }
    if (!empty($filters['start_date'])) {
        $filterText .= "From: " . $filters['start_date'] . ", ";
    }
    if (!empty($filters['end_date'])) {
        $filterText .= "To: " . $filters['end_date'] . ", ";
    }
    if (!empty($filters['status'])) {
        $filterText .= "Status: " . ucfirst($filters['status']) . ", ";
    }
    $filterText = rtrim($filterText, ", ");
    $pdf->Cell(0, 5, $filterText, 0, 1, 'C');
    $pdf->Ln(5);
    
    // Set font for the table header
    $pdf->SetFont('helvetica', 'B', 10);
    
    // Define column widths (must sum to less than page width, which is about 270mm on A4 landscape)
    $colWidth = [40, 40, 25, 70, 25, 25, 25, 20]; // Width for each column
    
    // Table header
    $pdf->SetFillColor(70, 31, 163); // Purple background for header
    $pdf->SetTextColor(255, 255, 255); // White text for header
    $pdf->Cell($colWidth[0], 10, 'Batch', 1, 0, 'C', true);
    $pdf->Cell($colWidth[1], 10, 'Student Name', 1, 0, 'C', true);
    $pdf->Cell($colWidth[2], 10, 'Session Date', 1, 0, 'C', true);
    $pdf->Cell($colWidth[3], 10, 'Session Title', 1, 0, 'C', true);
    $pdf->Cell($colWidth[4], 10, 'Status', 1, 0, 'C', true);
    $pdf->Cell($colWidth[5], 10, 'Check-in', 1, 0, 'C', true);
    $pdf->Cell($colWidth[6], 10, 'Check-out', 1, 0, 'C', true);
    $pdf->Cell($colWidth[7], 10, 'Duration', 1, 1, 'C', true); // Last parameter 1 means new line after this cell
    
    // Build query based on filters
    $query = "SELECT 
              b.name as batch_name,
              u.full_name as student_name,
              bs.date_time as session_date,
              bs.title as session_title,
              a.status,
              a.check_in_time,
              a.check_out_time,
              a.online_duration
            FROM 
              attendance a
            INNER JOIN 
              users u ON a.student_id = u.id
            INNER JOIN 
              batch_sessions bs ON a.session_id = bs.id
            INNER JOIN 
              batches b ON a.batch_id = b.id
            WHERE 
              b.teacher_id = :teacher_id";
              
    $params = [':teacher_id' => $teacher_id];
    
    // Apply filters - only add conditions if filters are set
    if (!empty($filters['batch_id'])) {
        $query .= " AND a.batch_id = :batch_id";
        $params[':batch_id'] = $filters['batch_id'];
    }
    
    if (!empty($filters['start_date'])) {
        $query .= " AND DATE(bs.date_time) >= :start_date";
        $params[':start_date'] = $filters['start_date'];
    }
    
    if (!empty($filters['end_date'])) {
        $query .= " AND DATE(bs.date_time) <= :end_date";
        $params[':end_date'] = $filters['end_date'];
    }
    
    if (!empty($filters['status'])) {
        $query .= " AND a.status = :status";
        $params[':status'] = $filters['status'];
    }
    
    $query .= " ORDER BY bs.date_time DESC, b.name, u.full_name";
    
    try {
        $stmt = $db->prepare($query);
        foreach($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        throw new Exception("Database error: " . $e->getMessage());
    }
    
    // Reset text color for data
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetFont('helvetica', '', 9);
    
    // Add data rows
    $recordCount = $stmt->rowCount();
    if ($recordCount == 0) {
        // No records found
        $pdf->SetFont('helvetica', 'I', 10);
        $pdf->Cell(array_sum($colWidth), 10, 'No attendance records found matching your criteria.', 1, 1, 'C');
    } else {
        $fill = false; // To alternate row colors
        
        while ($record = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Set background color for alternating rows
            $fill = !$fill;
            if ($fill) {
                $pdf->SetFillColor(240, 240, 250); // Light purple for alternate rows
            } else {
                $pdf->SetFillColor(255, 255, 255); // White for regular rows
            }
            
            // Get status color
            $statusColor = [0, 0, 0]; // Default black
            switch(strtolower($record['status'])) {
                case 'present':
                    $statusColor = [0, 128, 0]; // Green
                    break;
                case 'absent':
                    $statusColor = [200, 0, 0]; // Red
                    break;
                case 'late':
                    $statusColor = [255, 140, 0]; // Orange
                    break;
                case 'excused':
                    $statusColor = [0, 0, 200]; // Blue
                    break;
            }
            
            // Format dates and times
            $sessionDate = $record['session_date'] ? date('Y-m-d', strtotime($record['session_date'])) : 'N/A';
            $checkIn = $record['check_in_time'] ? date('H:i', strtotime($record['check_in_time'])) : 'N/A';
            $checkOut = $record['check_out_time'] ? date('H:i', strtotime($record['check_out_time'])) : 'N/A';
            $duration = $record['online_duration'] ? $record['online_duration'] . ' min' : 'N/A';
            
            // Add row data with MultiCell to handle longer text
            $lineHeight = 6; // Height for each cell
            $maxHeight = $lineHeight;
            
            // Save current position
            $startY = $pdf->GetY();
            $startX = $pdf->GetX();
            
            // First check if we need a page break (if less than 20mm space left)
            if ($pdf->GetY() > $pdf->getPageHeight() - 25) {
                $pdf->AddPage();
                $startY = $pdf->GetY();
            }
            
            // Calculate and draw multiline cells (to handle text wrapping)
            $pdf->MultiCell($colWidth[0], $lineHeight, $record['batch_name'] ?? 'N/A', 1, 'L', $fill, 0, $startX, $startY);
            $currX = $startX + $colWidth[0];
            $currHeight = $pdf->getY() - $startY;
            $maxHeight = max($maxHeight, $currHeight);
            
            $pdf->MultiCell($colWidth[1], $lineHeight, $record['student_name'] ?? 'N/A', 1, 'L', $fill, 0, $currX, $startY);
            $currX += $colWidth[1];
            $currHeight = $pdf->getY() - $startY;
            $maxHeight = max($maxHeight, $currHeight);
            
            $pdf->MultiCell($colWidth[2], $lineHeight, $sessionDate, 1, 'C', $fill, 0, $currX, $startY);
            $currX += $colWidth[2];
            
            $pdf->MultiCell($colWidth[3], $lineHeight, $record['session_title'] ?? 'N/A', 1, 'L', $fill, 0, $currX, $startY);
            $currX += $colWidth[3];
            $currHeight = $pdf->getY() - $startY;
            $maxHeight = max($maxHeight, $currHeight);
            
            // Change text color for status
            $pdf->setTextColor($statusColor[0], $statusColor[1], $statusColor[2]);
            $pdf->MultiCell($colWidth[4], $lineHeight, ucfirst($record['status'] ?? 'N/A'), 1, 'C', $fill, 0, $currX, $startY);
            $pdf->setTextColor(0, 0, 0); // Reset text color
            $currX += $colWidth[4];
            
            $pdf->MultiCell($colWidth[5], $lineHeight, $checkIn, 1, 'C', $fill, 0, $currX, $startY);
            $currX += $colWidth[5];
            
            $pdf->MultiCell($colWidth[6], $lineHeight, $checkOut, 1, 'C', $fill, 0, $currX, $startY);
            $currX += $colWidth[6];
            
            $pdf->MultiCell($colWidth[7], $lineHeight, $duration, 1, 'C', $fill, 0, $currX, $startY);
            
            // Move to next line after tallest cell
            $pdf->SetXY($startX, $startY + $maxHeight);
        }
    }
    
    // Add a summary section
    $pdf->Ln(10);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 8, 'Summary', 0, 1, 'L');
    $pdf->SetFont('helvetica', '', 10);
    
    // Calculate summary statistics
    $totalSessions = 0;
    $presentCount = 0;
    $absentCount = 0;
    $lateCount = 0;
    $excusedCount = 0;
    
    // Get summary data from the database
    $query = "SELECT 
              status,
              COUNT(*) as count
            FROM 
              attendance a
            INNER JOIN 
              batches b ON a.batch_id = b.id
            WHERE 
              b.teacher_id = :teacher_id";
              
    // Apply same filters as main query
    $params = [':teacher_id' => $teacher_id];
    
    if (!empty($filters['batch_id'])) {
        $query .= " AND a.batch_id = :batch_id";
    }
    
    if (!empty($filters['start_date']) || !empty($filters['end_date'])) {
        $query .= " AND a.session_id IN (SELECT id FROM batch_sessions WHERE 1=1";
        
        if (!empty($filters['start_date'])) {
            $query .= " AND DATE(date_time) >= :start_date";
        }
        
        if (!empty($filters['end_date'])) {
            $query .= " AND DATE(date_time) <= :end_date";
        }
        
        $query .= ")";
    }
    
    $query .= " GROUP BY status";
    
    $stmt = $db->prepare($query);
    foreach($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        switch($row['status']) {
            case 'present':
                $presentCount = $row['count'];
                $totalSessions += $row['count'];
                break;
            case 'absent':
                $absentCount = $row['count'];
                $totalSessions += $row['count'];
                break;
            case 'late':
                $lateCount = $row['count'];
                $totalSessions += $row['count'];
                break;
            case 'excused':
                $excusedCount = $row['count'];
                $totalSessions += $row['count'];
                break;
        }
    }
    
    // Print summary statistics
    $pdf->Cell(40, 8, 'Total Sessions:', 0, 0, 'L');
    $pdf->Cell(30, 8, $totalSessions, 0, 1, 'L');
    
    $pdf->SetTextColor(0, 128, 0); // Green
    $pdf->Cell(40, 8, 'Present:', 0, 0, 'L');
    $pdf->Cell(30, 8, $presentCount . ' (' . ($totalSessions ? round(($presentCount / $totalSessions) * 100, 1) : 0) . '%)', 0, 1, 'L');
    
    $pdf->SetTextColor(200, 0, 0); // Red
    $pdf->Cell(40, 8, 'Absent:', 0, 0, 'L');
    $pdf->Cell(30, 8, $absentCount . ' (' . ($totalSessions ? round(($absentCount / $totalSessions) * 100, 1) : 0) . '%)', 0, 1, 'L');
    
    $pdf->SetTextColor(255, 140, 0); // Orange
    $pdf->Cell(40, 8, 'Late:', 0, 0, 'L');
    $pdf->Cell(30, 8, $lateCount . ' (' . ($totalSessions ? round(($lateCount / $totalSessions) * 100, 1) : 0) . '%)', 0, 1, 'L');
    
    $pdf->SetTextColor(0, 0, 200); // Blue
    $pdf->Cell(40, 8, 'Excused:', 0, 0, 'L');
    $pdf->Cell(30, 8, $excusedCount . ' (' . ($totalSessions ? round(($excusedCount / $totalSessions) * 100, 1) : 0) . '%)', 0, 1, 'L');
    
    // Reset text color
    $pdf->SetTextColor(0, 0, 0);
    
    // Add report generation info
    $pdf->Ln(5);
    $pdf->SetFont('helvetica', 'I', 8);
    $pdf->Cell(0, 5, 'Report generated on: ' . date('Y-m-d H:i:s'), 0, 1, 'R');
}
?>
