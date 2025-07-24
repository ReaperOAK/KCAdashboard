# KCAdashboard Frontend – Classroom Components Documentation

## Overview

The `classroom` subfolder under `components` contains React components related to classroom management and participation in KCAdashboard. These components support workflows for teachers and students to manage assignments, attendance, schedules, and classroom materials.

---

# Recurring Classes Feature

## Overview
The Recurring Classes feature allows teachers to automatically schedule multiple class sessions based on their batch schedule. Instead of manually creating each session, teachers can now generate recurring sessions that follow the batch's predefined schedule.

## How It Works

### Batch Schedule Structure
Each batch has a schedule field stored as JSON:
```json
{
  "days": ["Mon", "Wed", "Fri"],
  "time": "09:00",
  "duration": 60
}
```

### Recurring Class Creation Process
1. **Teacher selects a classroom** from the Classroom Management page
2. **Clicks "Recurring Classes"** button
3. **RecurringClassModal opens** showing:
   - Current batch schedule
   - Form to configure recurring parameters
   - Preview of sessions to be created
4. **Teacher configures**:
   - Session title template (can use `{week}` and `{date}` placeholders)
   - Start date
   - End date or number of weeks
   - Session type (online/offline)
   - Meeting link (for online sessions)
   - Description template
   - Optional custom duration override
5. **System generates sessions** based on:
   - Batch schedule days and time
   - Date range specified
   - Conflict checking with existing sessions
6. **Notifications sent** to all students in the classroom

## Features

### Smart Conflict Detection
- Checks for overlapping sessions with teacher's existing schedule
- Skips conflicting time slots automatically
- Provides feedback on skipped sessions

### Template System
- Title template supports `{week}` and `{date}` placeholders
- Description template supports same placeholders
- Example: "Chess Class - Week {week}" becomes "Chess Class - Week 1", "Chess Class - Week 2", etc.

### UI Components

#### RecurringClassModal
- **Location**: `src/components/classroom/RecurringClassModal.js`
- **Props**:
  - `classroom` - Classroom object
  - `onClose` - Close handler
  - `onSuccess` - Success callback with sessions count
- **Features**:
  - Loads batch schedule automatically
  - Shows schedule preview
  - Generates session preview
  - Form validation
  - Loading states
  - Error handling

---

## File Structure


```
components/classroom/
  AssignmentsView.js        # Displays classroom assignments
  AttendanceModal.js        # Modal for managing classroom attendance
  ClassroomCalendar.js      # Calendar for classroom events and sessions
  MaterialsView.js          # Shows classroom materials
  RecurringClassModal.js    # NEW: Modal for creating recurring classes based on batch schedule
  LoadingSkeleton.js        # Animated loading skeleton for classroom pages
  LoadingSpinner.js         # Beautiful, accessible loading spinner for classroom pages
  ModalOverlay.js           # Modal overlay with focus trap and escape close
  StatusBadge.js            # Status badge for classroom items (active, upcoming, etc.)
  ViewSwitcher.js           # Switches between classroom views (calendar, materials, assignments)
  ErrorAlert.js             # Error alert with icon and color tokens
  ErrorState.js             # General error state display with icon and animation
  MaterialCard.js           # Card for displaying classroom material info
```

---


## File Explanations

- **AssignmentsView.js**  
  Displays a list of assignments for a classroom, supporting submission and grading workflows.

- **AttendanceModal.js**  
  Modal dialog for marking and viewing classroom attendance.

- **ClassroomCalendar.js**  
  Calendar component for displaying classroom events, sessions, and schedules. If a teacher attempts to schedule a class that overlaps with another of their sessions, the backend will reject the request and the frontend will display a user-friendly error message.

- **MaterialsView.js**  
  Shows learning materials and resources available to the classroom.

- **LoadingSkeleton.js**  
  Animated loading skeleton for classroom management pages. Uses color tokens, dark mode, and improved accessibility.

- **LoadingSpinner.js**  
  Beautiful, accessible loading spinner for classroom pages. Uses color tokens, dark mode, and responsive layout.

- **ModalOverlay.js**  
  Modal overlay for dialogs, with focus trap and escape close. Uses color tokens, dark mode, and backdrop blur for a modern look.

- **StatusBadge.js**  
  Status badge for classroom items (active, upcoming, etc.). Uses color tokens, dark mode, and Lucide icons for clarity and accessibility.

- **ViewSwitcher.js**  
  Switches between classroom views (calendar, materials, assignments). Uses color tokens, dark mode, and accessible button states.

- **ErrorAlert.js**  
  Error alert with icon, color tokens, and animation. Accessible and responsive.

- **ErrorState.js**  
  General error state display with icon, color tokens, and animation. Accessible and responsive.

- **MaterialCard.js**  
  Card for displaying classroom material info. Uses color tokens, dark mode, and responsive layout.

---


## How These Components Work

- Components are imported and used in classroom management pages or other components.
- All subcomponents are modular, single-responsibility, and optimized with React.memo.
- They interact with the backend via API calls to fetch, update, or display classroom data.
- All use the color system in `../../../../colour_scheme.md` and support dark mode.
- All interactive elements are accessible (ARIA, keyboard nav, focus/hover/disabled states).
- Designed to be reusable and composable for classroom-related workflows.

---


## Example Usage

- Teachers use `AssignmentsView.js` to manage assignments and `AttendanceModal.js` to mark attendance.
- Students view classroom schedules with `ClassroomCalendar.js` and access materials with `MaterialsView.js`.
- All classroom pages now use `LoadingSkeleton.js` and `LoadingSpinner.js` for loading states, `ErrorAlert.js` and `ErrorState.js` for error/empty states, and `ModalOverlay.js` for dialogs.
- `StatusBadge.js` and `ViewSwitcher.js` are used for status indication and view switching in classroom UIs.

---


## Best Practices

- Keep components focused and reusable.
- Use color tokens and dark mode for all UI elements.
- Ensure all interactive elements are accessible and responsive.
- Use React.memo for performance and single responsibility.
- Document component props and usage for maintainability.

---

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.

---

# Materials Management Feature

## Overview
The Materials Management feature enables teachers to upload, organize, and manage classroom materials and resources in KCAdashboard. It supports various file types and provides a seamless way to share resources with students.

## How It Works

### Materials Structure
Materials are organized into folders and can be of various types:
- **Files**: Documents, PDFs, images, etc.
- **Videos**: Links to video resources (e.g., YouTube, Vimeo)
- **Assignments**: Specific tasks or assignments for students

### Materials Management Process
1. **Teacher accesses MaterialsView** from the Classroom Management page
2. **Uploads materials** using the upload button
3. **Organizes materials** into folders or categories
4. **Sets visibility** options for students
5. **Saves changes**, updating the classroom materials

## Features

### Multiple File Upload for Materials
- Teachers can upload multiple files at once as classroom materials.
- UI shows selected file count and names.
- Each file is validated and creates a separate resource entry.
- Mixed uploads (files + video links) are supported.

### Drag-and-Drop Support
- Easily reorder materials or move them between folders.
- Supports keyboard navigation and screen reader announcements.

### Folder Organization
- Create, rename, and delete folders to organize materials.
- Nested folders are supported for hierarchical organization.

### Material Previews
- Preview documents, images, and videos directly in the browser.
- Supports common file types: PDF, DOCX, PPTX, JPG, PNG, MP4, etc.

### UI Components

#### MaterialsView
- **Location**: `src/components/classroom/MaterialsView.js`
- **Props**:
  - `classroom` - Classroom object
  - `onClose` - Close handler
  - `onSuccess` - Success callback with materials count
- **Features**:
  - Displays materials in a grid or list view
  - Supports search and filter by type, name, or date
  - Shows file type icons and upload status
  - Drag-and-drop reordering and folder management
  - Material preview and download options

---

## File Structure


```
components/classroom/
  AssignmentsView.js        # Displays classroom assignments
  AttendanceModal.js        # Modal for managing classroom attendance
  ClassroomCalendar.js      # Calendar for classroom events and sessions
  MaterialsView.js          # Shows classroom materials
  RecurringClassModal.js    # Modal for creating recurring classes based on batch schedule
  LoadingSkeleton.js        # Animated loading skeleton for classroom pages
  LoadingSpinner.js         # Beautiful, accessible loading spinner for classroom pages
  ModalOverlay.js           # Modal overlay with focus trap and escape close
  StatusBadge.js            # Status badge for classroom items (active, upcoming, etc.)
  ViewSwitcher.js           # Switches between classroom views (calendar, materials, assignments)
  ErrorAlert.js             # Error alert with icon and color tokens
  ErrorState.js             # General error state display with icon and animation
  MaterialCard.js           # Card for displaying classroom material info
```

---


## File Explanations

- **AssignmentsView.js**  
  Displays a list of assignments for a classroom, supporting submission and grading workflows.

- **AttendanceModal.js**  
  Modal dialog for marking and viewing classroom attendance.

- **ClassroomCalendar.js**  
  Calendar component for displaying classroom events, sessions, and schedules. If a teacher attempts to schedule a class that overlaps with another of their sessions, the backend will reject the request and the frontend will display a user-friendly error message.

- **MaterialsView.js**  
  Shows learning materials and resources available to the classroom.

- **LoadingSkeleton.js**  
  Animated loading skeleton for classroom management pages. Uses color tokens, dark mode, and improved accessibility.

- **LoadingSpinner.js**  
  Beautiful, accessible loading spinner for classroom pages. Uses color tokens, dark mode, and responsive layout.

- **ModalOverlay.js**  
  Modal overlay for dialogs, with focus trap and escape close. Uses color tokens, dark mode, and backdrop blur for a modern look.

- **StatusBadge.js**  
  Status badge for classroom items (active, upcoming, etc.). Uses color tokens, dark mode, and Lucide icons for clarity and accessibility.

- **ViewSwitcher.js**  
  Switches between classroom views (calendar, materials, assignments). Uses color tokens, dark mode, and accessible button states.

- **ErrorAlert.js**  
  Error alert with icon, color tokens, and animation. Accessible and responsive.

- **ErrorState.js**  
  General error state display with icon, color tokens, and animation. Accessible and responsive.

- **MaterialCard.js**  
  Card for displaying classroom material info. Uses color tokens, dark mode, and responsive layout.

---


## How These Components Work

- Components are imported and used in classroom management pages or other components.
- All subcomponents are modular, single-responsibility, and optimized with React.memo.
- They interact with the backend via API calls to fetch, update, or display classroom data.
- All use the color system in `../../../../colour_scheme.md` and support dark mode.
- All interactive elements are accessible (ARIA, keyboard nav, focus/hover/disabled states).
- Designed to be reusable and composable for classroom-related workflows.

---


## Example Usage

- Teachers use `AssignmentsView.js` to manage assignments and `AttendanceModal.js` to mark attendance.
- Students view classroom schedules with `ClassroomCalendar.js` and access materials with `MaterialsView.js`.
- All classroom pages now use `LoadingSkeleton.js` and `LoadingSpinner.js` for loading states, `ErrorAlert.js` and `ErrorState.js` for error/empty states, and `ModalOverlay.js` for dialogs.
- `StatusBadge.js` and `ViewSwitcher.js` are used for status indication and view switching in classroom UIs.

---


## Best Practices

- Keep components focused and reusable.
- Use color tokens and dark mode for all UI elements.
- Ensure all interactive elements are accessible and responsive.
- Use React.memo for performance and single responsibility.
- Document component props and usage for maintainability.

---

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.

---

## July 2025: Scheduling & Timezone Improvements
- RecurringClassModal and single class scheduling modals now prevent scheduling in the past (UI + backend).
- All date logic and display uses IST (Asia/Kolkata) timezone.
- User-friendly error messages for invalid scheduling attempts.
