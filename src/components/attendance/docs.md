## Attendance Components

### AttendanceSkeleton
- Loading skeleton for attendance data.
- Props: none

### BatchSelect
- Dropdown for selecting a batch.
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
- Modal for editing attendance settings.
- Props:
  - `settings`: object
  - `setSettings`: function
  - `onClose`: function
  - `onSave`: function
