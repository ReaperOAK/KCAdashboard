## Attendance Components (July 2025 UI/UX Overhaul)

All attendance components now follow the Kolkata Chess Academy design system (see `colour_scheme.md`), are fully accessible, responsive, and optimized for performance.

### StudentAttendanceTable
- Beautiful, responsive table for student attendance summary.
- Alternating row backgrounds, status icons, color tokens, and accessibility improvements.
- Props:
  - `students`: array of student objects (see PropTypes in code)

### AttendanceSkeleton
- Modern shimmer skeleton for attendance data loading.
- Props: none

### BatchSelect
- Dropdown for selecting a batch, with custom chevron icon and appearance-none.
- Props:
  - `batches`: array of batch objects
  - `selectedBatch`: string (selected batch id)
  - `onChange`: function (change handler)

### ExportControls
- Controls for selecting date range and export format, and exporting attendance reports.
- Props:
  - `dateRange`: {start, end}
  - `setDateRange`: function
  - `exportFormat`: string
  - `setExportFormat`: function
  - `onExport`: function
  - `disabled`: boolean

### SettingsModal
- Modal for editing attendance settings, with card background and fade/scale animation.
- Props:
  - `settings`: object
  - `setSettings`: function
  - `onClose`: function
  - `onSave`: function

### ErrorAlert
- Error alert with icon, color tokens, and fade-in animation.

### General Notes
- All skeletons use shimmer blocks.
- All tables, forms, and controls use correct color tokens, icons, and improved layouts.
- All interactive elements have proper focus/hover/disabled states and are keyboard navigable.
