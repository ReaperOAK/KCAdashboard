
# Support Components – Leave Requests, Ticketing, and FAQ UI/UX Refactor (2025-07-14)


## Overview

The following support components were refactored for a beautiful, modern, and accessible UI/UX:
- `LeaveRequestsAdmin.js` (admin leave requests page)
- `LeaveRequestsTable.js` (responsive, accessible table)
- `LeaveRequestRow.js` (single leave request row, with status and actions)
- `LeaveRequestsSkeleton.js` (loading skeleton)
- `ErrorAlert.js` (error state)
- `EmptyState.js` (empty state)
- `SupportSystem.js` (admin support/ticket/FAQ page)
- `TicketTable.js` (responsive ticket table)
- `TicketDetailModal.js` (animated, accessible ticket details modal)
- `FaqModal.js` (animated, accessible FAQ modal)
- `FaqCard.js` (FAQ display card)


## Key Improvements

- **UI/UX:**
  - All components use the design system and color tokens from `colour_scheme.md` and `tailwind.config.js`.
  - Fully responsive layouts for all screen sizes (mobile, tablet, desktop).
  - Beautiful, modern tables and cards with odd row striping, hover/focus states, and clear action buttons.
  - Custom modals for leave approval/rejection, ticket details, and FAQ creation, all with animation, focus trap, and keyboard support.
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

- `LeaveRequestsAdmin.js` orchestrates data fetching, state, and modal logic for leave requests.
- `LeaveRequestsTable.js` displays the table and delegates each row to `LeaveRequestRow.js`.
- `LeaveRequestRow.js` handles row rendering, status, and action buttons.
- `LeaveRequestsSkeleton.js`, `ErrorAlert.js`, and `EmptyState.js` provide loading, error, and empty states.
- `SupportSystem.js` orchestrates the admin support/ticket/FAQ page, tab navigation, and modal logic.
- `TicketTable.js` displays tickets in a responsive, accessible table or card view.
- `TicketDetailModal.js` shows animated, accessible ticket details and status change UI.
- `FaqModal.js` shows animated, accessible FAQ creation UI.
- `FaqCard.js` displays FAQ entries with delete action.


## Example

```jsx
import SupportSystem from './pages/admin/SupportSystem';
<Route path="/admin/support" element={<SupportSystem />} />
```

## Best Practices
- Use color tokens and Tailwind utility classes for all styling.
- Keep each component focused and documented.
- Ensure all interactive elements are accessible and responsive.

---

For more details on the design system, see `../../../../colour_scheme.md`.
