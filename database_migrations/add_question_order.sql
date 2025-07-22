-- Add order_index column to quiz_questions table to support drag-and-drop reordering
ALTER TABLE quiz_questions 
ADD COLUMN order_index INT DEFAULT 0 AFTER type;

-- Add index for better performance on ordering
ALTER TABLE quiz_questions 
ADD INDEX idx_quiz_order (quiz_id, order_index);

-- Update existing records to have sequential order_index values
-- This ensures existing questions maintain their current order
SET @row_number = 0;
UPDATE quiz_questions 
SET order_index = (@row_number:=@row_number+1) 
ORDER BY quiz_id, id;

-- For better organization, reset row_number for each quiz
SET @row_number = 0;
SET @current_quiz_id = 0;
UPDATE quiz_questions 
SET order_index = (
    CASE 
        WHEN @current_quiz_id = quiz_id THEN @row_number:=@row_number+1
        ELSE @row_number:=1 AND @current_quiz_id:=quiz_id
    END
)
ORDER BY quiz_id, id;
