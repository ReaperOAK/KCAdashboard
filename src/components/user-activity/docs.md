# User Activity Components – UI/UX & Refactor Changelog (July 2025)

## Overview
All user-activity components have been refactored for:
- Beautiful, modern, and responsive UI using Tailwind and the KCA color system
- Accessibility (ARIA, keyboard navigation, semantic HTML)
- Single-responsibility principle (each file does one job)
- Performance (React.memo, minimal re-renders)
- Consistent visual hierarchy, spacing, and theming

## Components Updated

- **ActivityItem**: Pure, accessible, responsive list item for a user activity. Uses color tokens, icon for IP, semantic time, and smooth transitions.
- **ActivityList**: Renders a beautiful, accessible, responsive list of user activities. Includes empty state with icon and message.
- **ActivityListItem**: Responsive, accessible, and visually clear list item for page view activities. Uses color tokens, icon for IP, and semantic time.
- **ActivitySkeleton**: Card-like, animated loading skeleton for activity lists. Uses color tokens, spacing, and ARIA.
- **FilterSelect**: Accessible, responsive dropdown for filtering activity type. Custom icons, color tokens, and focus/hover states.
- **Pagination**: Responsive, beautiful pagination controls. Icon buttons, color tokens, and always in a single row for all screen sizes.
- **UserDetailsCard**: Card for user details with avatar/icon, color tokens, spacing, and responsive layout.

## Design System
- All components use the color tokens and UI patterns from `colour_scheme.md` and `tailwind.config.js`.
- Spacing, font sizes, and visual hierarchy follow the KCA design system.
- All interactive elements have focus/hover/active states and are keyboard accessible.

## Accessibility
- ARIA roles and labels are used throughout.
- Semantic HTML (e.g., <nav>, <section>, <ul>, <li>, <time>)
- All components are screen reader and keyboard friendly.

## Performance
- All list and UI components use `React.memo` for memoization.
- Minimal re-renders and clean, focused props.

## How to Use
- Import and use each component as needed in user-activity pages.
- All components are responsive and mobile-friendly out of the box.

---

_Last major UI/UX refactor: July 2025_
