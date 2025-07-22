# Quiz Question Drag & Drop Reordering

This feature allows teachers to drag and drop quiz questions to reorder them, similar to how PDF editors work. Teachers can easily rearrange questions by clicking and dragging the grip handle.

## Features Implemented

### 1. Database Changes
- Added `order_index` column to `quiz_questions` table
- Questions are now ordered by `order_index ASC, id ASC`
- Migration script provided in `database_migrations/add_question_order.sql`

### 2. Backend API
- New endpoint: `/api/quiz/reorder-questions.php`
- Updated Quiz model to handle `order_index` in create/update operations
- Added `reorderQuestions()` method to QuizApi

### 3. Frontend Components

#### SortableQuestionsList (`src/components/quiz/SortableQuestionsList.js`)
- Main drag-and-drop container using @dnd-kit
- Provides visual instructions and feedback
- Handles drag start, end, and cancel events
- Shows save status and unsaved changes indicators

#### DraggableQuestionCard (`src/components/quiz/DraggableQuestionCard.js`)
- Individual draggable question wrapper
- Beautiful drag handle with grip icon (⋮)
- Question header with number and type badges
- Delete button integration
- Visual feedback during dragging

#### Updated QuizCreator (`src/pages/teacher/QuizCreator.js`)
- Integration with new drag-and-drop components
- Question reordering handlers
- Auto-save functionality for question order

### 4. Visual Design
- **Drag Handle**: Grip icon (⋮) that appears on hover
- **Question Headers**: Gradient background with question number and type
- **Drag Feedback**: Questions scale up and rotate slightly when dragged
- **Status Indicators**: Blue notification bar for instructions, yellow for unsaved changes
- **Accessibility**: Full keyboard navigation and screen reader support

## How to Use

1. **Create/Edit a Quiz**: Go to quiz creation or editing page
2. **See Questions**: Each question now has a grip handle (⋮) on the left
3. **Drag to Reorder**: Click and drag any question to a new position
4. **Visual Feedback**: Questions show visual feedback while dragging
5. **Auto-Save**: Changes are automatically saved to the database
6. **Success Toast**: Confirmation message appears when order is saved

## Technical Details

### Libraries Used
- `@dnd-kit/core` - Core drag and drop functionality
- `@dnd-kit/sortable` - Sortable list implementation
- `@dnd-kit/utilities` - Helper functions for transforms
- `react-hot-toast` - Success/error notifications

### Database Schema
```sql
ALTER TABLE quiz_questions 
ADD COLUMN order_index INT DEFAULT 0 AFTER type,
ADD INDEX idx_quiz_order (quiz_id, order_index);
```

### API Endpoint
```
PUT /api/quiz/reorder-questions.php?id={quiz_id}
Content-Type: application/json

{
  "questions": [
    {"id": 1, "order_index": 1},
    {"id": 2, "order_index": 2},
    {"id": 3, "order_index": 3}
  ]
}
```

## Accessibility Features

- **Keyboard Navigation**: Arrow keys to navigate, Space/Enter to grab/drop
- **Screen Reader**: Proper ARIA labels and announcements
- **Focus Management**: Clear focus indicators and logical tab order
- **High Contrast**: Works with high contrast mode and dark themes

## Browser Support

- Chrome 80+
- Firefox 76+
- Safari 13+
- Edge 80+

## Benefits

1. **Intuitive UX**: Familiar drag-and-drop interaction like PDF editors
2. **Visual Feedback**: Clear indication of what's happening during drag
3. **Error Prevention**: Can't accidentally break question structure
4. **Mobile Friendly**: Touch-friendly drag handles and interactions
5. **Accessible**: Full keyboard and screen reader support
6. **Performance**: Optimized with React.memo and useCallback

## Future Enhancements

- Bulk question operations (select multiple, move all)
- Question preview during drag
- Undo/Redo functionality
- Question templates and quick-add options
