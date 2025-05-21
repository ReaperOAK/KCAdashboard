<?php
// Helper function to export quiz results to PDF
function exportQuizResults($db, $pdf, $teacher_id, $filters) {
    // Add a title
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Cell(0, 10, 'Quiz Results Report', 0, 1, 'C');
    
    // Add filter information
    $pdf->SetFont('helvetica', 'I', 9);
    $filterText = 'Filters: ';
    if (!empty($filters['batch_id'])) {
        $stmt = $db->prepare("SELECT name FROM batches WHERE id = ?");
        $stmt->execute([$filters['batch_id']]);
        $batchName = $stmt->fetchColumn() ?: 'Unknown';
        $filterText .= "Batch: " . $batchName . ", ";
    }
    if (!empty($filters['quiz_id'])) {
        $stmt = $db->prepare("SELECT title FROM quizzes WHERE id = ?");
        $stmt->execute([$filters['quiz_id']]);
        $quizTitle = $stmt->fetchColumn() ?: 'Unknown';
        $filterText .= "Quiz: " . $quizTitle . ", ";
    }
    if (!empty($filters['start_date'])) {
        $filterText .= "From: " . $filters['start_date'] . ", ";
    }
    if (!empty($filters['end_date'])) {
        $filterText .= "To: " . $filters['end_date'] . ", ";
    }
    $filterText = rtrim($filterText, ", ");
    $pdf->Cell(0, 5, $filterText, 0, 1, 'C');
    $pdf->Ln(5);
    
    // Set font for the table header
    $pdf->SetFont('helvetica', 'B', 10);
    
    // Define column widths
    $colWidth = [60, 40, 30, 30, 40, 30]; // Width for each column
    
    // Table header
    $pdf->SetFillColor(70, 31, 163); // Purple background for header
    $pdf->SetTextColor(255, 255, 255); // White text for header
    $pdf->Cell($colWidth[0], 10, 'Quiz Title', 1, 0, 'C', true);
    $pdf->Cell($colWidth[1], 10, 'Student Name', 1, 0, 'C', true);
    $pdf->Cell($colWidth[2], 10, 'Score (%)', 1, 0, 'C', true);
    $pdf->Cell($colWidth[3], 10, 'Time Taken (mins)', 1, 0, 'C', true);
    $pdf->Cell($colWidth[4], 10, 'Completion Date', 1, 0, 'C', true);
    $pdf->Cell($colWidth[5], 10, 'Difficulty', 1, 1, 'C', true);
    
    // Build query
    $query = "SELECT 
              q.title as quiz_title,
              u.full_name as student_name,
              qa.score,
              qa.time_taken,
              qa.completed_at,
              q.difficulty
            FROM 
              quiz_attempts qa
            INNER JOIN 
              quizzes q ON qa.quiz_id = q.id
            INNER JOIN 
              users u ON qa.user_id = u.id
            WHERE 
              q.created_by = :teacher_id";
    
    $params = [':teacher_id' => $teacher_id];
    
    // Apply filters
    if (!empty($filters['quiz_id'])) {
        $query .= " AND qa.quiz_id = :quiz_id";
        $params[':quiz_id'] = $filters['quiz_id'];
    }
    
    if (!empty($filters['batch_id'])) {
        $query .= " AND qa.user_id IN (SELECT student_id FROM batch_students WHERE batch_id = :batch_id)";
        $params[':batch_id'] = $filters['batch_id'];
    }
    
    if (!empty($filters['start_date'])) {
        $query .= " AND qa.completed_at >= :start_date";
        $params[':start_date'] = $filters['start_date'];
    }
    
    if (!empty($filters['end_date'])) {
        $query .= " AND qa.completed_at <= :end_date";
        $params[':end_date'] = $filters['end_date'];
    }
    
    $query .= " ORDER BY qa.completed_at DESC";
    
    $stmt = $db->prepare($query);
    foreach($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    // Reset text color for data
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetFont('helvetica', '', 9);
    
    // Add data rows
    $recordCount = $stmt->rowCount();
    if ($recordCount == 0) {
        $pdf->SetFont('helvetica', 'I', 10);
        $pdf->Cell(array_sum($colWidth), 10, 'No quiz records found matching your criteria.', 1, 1, 'C');
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
            
            // Format values
            $score = $record['score'];
            $time_taken = $record['time_taken'] ? round($record['time_taken'] / 60, 1) : 'N/A';
            $completed_date = date('Y-m-d H:i', strtotime($record['completed_at']));
            $difficulty = ucfirst($record['difficulty']);
            
            // Save current position
            $startY = $pdf->GetY();
            $startX = $pdf->GetX();
            
            // Check if we need a page break
            if ($pdf->GetY() > $pdf->getPageHeight() - 20) {
                $pdf->AddPage();
                $startY = $pdf->GetY();
            }
            
            // Draw cells
            $lineHeight = 6; // Height for each cell
            
            // Quiz title
            $pdf->MultiCell($colWidth[0], $lineHeight, $record['quiz_title'], 1, 'L', $fill, 0, $startX, $startY);
            $currX = $startX + $colWidth[0];
            
            // Student name
            $pdf->MultiCell($colWidth[1], $lineHeight, $record['student_name'], 1, 'L', $fill, 0, $currX, $startY);
            $currX += $colWidth[1];
            
            // Score - color based on score
            if ($score >= 80) {
                $pdf->SetTextColor(0, 128, 0); // Green
            } elseif ($score >= 60) {
                $pdf->SetTextColor(255, 140, 0); // Orange
            } else {
                $pdf->SetTextColor(200, 0, 0); // Red
            }
            $pdf->MultiCell($colWidth[2], $lineHeight, $score, 1, 'C', $fill, 0, $currX, $startY);
            $pdf->SetTextColor(0, 0, 0); // Reset text color
            $currX += $colWidth[2];
            
            // Time taken
            $pdf->MultiCell($colWidth[3], $lineHeight, $time_taken, 1, 'C', $fill, 0, $currX, $startY);
            $currX += $colWidth[3];
            
            // Completion date
            $pdf->MultiCell($colWidth[4], $lineHeight, $completed_date, 1, 'C', $fill, 0, $currX, $startY);
            $currX += $colWidth[4];
            
            // Difficulty
            $pdf->MultiCell($colWidth[5], $lineHeight, $difficulty, 1, 'C', $fill, 0, $currX, $startY);
            
            // Move to next line
            $pdf->SetY($startY + $lineHeight);
        }
    }
    
    // Add summary statistics
    $pdf->Ln(10);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 8, 'Quiz Performance Summary', 0, 1, 'L');
    $pdf->SetFont('helvetica', '', 10);
    
    // Get quiz stats
    $stats_query = "SELECT 
                   COUNT(*) as attempt_count,
                   AVG(qa.score) as avg_score,
                   MIN(qa.score) as min_score,
                   MAX(qa.score) as max_score,
                   AVG(qa.time_taken) as avg_time
                  FROM 
                   quiz_attempts qa
                  INNER JOIN 
                   quizzes q ON qa.quiz_id = q.id
                  WHERE 
                   q.created_by = :teacher_id";
    
    // Reset params for stats query to avoid parameter mismatches
    $stats_params = [':teacher_id' => $teacher_id];
    
    // Apply same filters but rebuild parameters array for stats query
    if (!empty($filters['quiz_id'])) {
        $stats_query .= " AND qa.quiz_id = :quiz_id";
        $stats_params[':quiz_id'] = $filters['quiz_id'];
    }
    
    if (!empty($filters['batch_id'])) {
        $stats_query .= " AND qa.user_id IN (SELECT student_id FROM batch_students WHERE batch_id = :batch_id)";
        $stats_params[':batch_id'] = $filters['batch_id'];
    }
    
    if (!empty($filters['start_date'])) {
        $stats_query .= " AND qa.completed_at >= :start_date";
        $stats_params[':start_date'] = $filters['start_date'];
    }
    
    if (!empty($filters['end_date'])) {
        $stats_query .= " AND qa.completed_at <= :end_date";
        $stats_params[':end_date'] = $filters['end_date'];
    }
    
    try {
        $stats_stmt = $db->prepare($stats_query);
        foreach($stats_params as $key => $value) {
            $stats_stmt->bindValue($key, $value);
        }
        $stats_stmt->execute();
        $stats = $stats_stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("Stats query error: " . $e->getMessage());
        $pdf->SetTextColor(200, 0, 0); // Red text for error
        $pdf->Cell(0, 8, 'Unable to generate statistics: ' . $e->getMessage(), 0, 1, 'L');
        $pdf->SetTextColor(0, 0, 0); // Reset text color
        $stats = [
            'attempt_count' => 0,
            'avg_score' => 0,
            'min_score' => 0,
            'max_score' => 0,
            'avg_time' => 0
        ];
    }
    
    // Print summary stats
    $pdf->Cell(50, 8, 'Total Quiz Attempts:', 0, 0, 'L');
    $pdf->Cell(20, 8, $stats['attempt_count'] ?? 0, 0, 1, 'L');
    
    $pdf->Cell(50, 8, 'Average Score:', 0, 0, 'L');
    $pdf->Cell(20, 8, round($stats['avg_score'] ?? 0, 1) . '%', 0, 1, 'L');
    
    $pdf->Cell(50, 8, 'Highest Score:', 0, 0, 'L');
    $pdf->Cell(20, 8, round($stats['max_score'] ?? 0, 1) . '%', 0, 1, 'L');
    
    $pdf->Cell(50, 8, 'Lowest Score:', 0, 0, 'L');
    $pdf->Cell(20, 8, round($stats['min_score'] ?? 0, 1) . '%', 0, 1, 'L');
    
    $pdf->Cell(50, 8, 'Average Time Taken:', 0, 0, 'L');
    $avg_time_mins = $stats['avg_time'] ? round($stats['avg_time'] / 60, 1) : 0;
    $pdf->Cell(20, 8, $avg_time_mins . ' mins', 0, 1, 'L');
    
    // Add report generation info
    $pdf->Ln(5);
    $pdf->SetFont('helvetica', 'I', 8);
    $pdf->Cell(0, 5, 'Report generated on: ' . date('Y-m-d H:i:s'), 0, 1, 'R');
}
?>
