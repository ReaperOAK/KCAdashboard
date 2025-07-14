# Support Components – Leave Requests UI/UX Refactor (2025-07-14)

## Overview

The following support components were refactored for a beautiful, modern, and accessible UI/UX:
- `LeaveRequestsAdmin.js` (admin leave requests page)
- `LeaveRequestsTable.js` (responsive, accessible table)
- `LeaveRequestRow.js` (single leave request row, with status and actions)
- `LeaveRequestsSkeleton.js` (loading skeleton)
- `ErrorAlert.js` (error state)
- `EmptyState.js` (empty state)

## Key Improvements

- **UI/UX:**
  - All components use the design system and color tokens from `colour_scheme.md` and `tailwind.config.js`.
  - Fully responsive layouts for all screen sizes (mobile, tablet, desktop).
  - Beautiful, modern table with odd row striping, hover/focus states, and clear action buttons.
  - Custom modal for leave approval/rejection comments (no browser prompt).
  - Consistent iconography and visual feedback for status and actions.
  - All interactive elements have accessible focus, hover, and disabled states.
- **Performance:**
  - All components use `React.memo` for memoization.
  - No unnecessary re-renders or prop drilling.
- **Single Responsibility:**
  - Each file/component does one job only and is documented with JSDoc.
- **Accessibility:**
  - ARIA labels, keyboard navigation, and color contrast validated.

## Usage

- `LeaveRequestsAdmin.js` orchestrates data fetching, state, and modal logic.
- `LeaveRequestsTable.js` displays the table and delegates each row to `LeaveRequestRow.js`.
- `LeaveRequestRow.js` handles row rendering, status, and action buttons.
- `LeaveRequestsSkeleton.js`, `ErrorAlert.js`, and `EmptyState.js` provide loading, error, and empty states.

## Example

```jsx
import LeaveRequestsAdmin from './pages/admin/LeaveRequestsAdmin';
<Route path="/admin/leave-requests" element={<LeaveRequestsAdmin />} />
```

## Best Practices
- Use color tokens and Tailwind utility classes for all styling.
- Keep each component focused and documented.
- Ensure all interactive elements are accessible and responsive.

---

For more details on the design system, see `../../../../colour_scheme.md`.
