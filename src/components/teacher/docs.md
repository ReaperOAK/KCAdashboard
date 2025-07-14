# Teacher Modals & Feedback Components

## Overview

This folder contains all modal and feedback-related UI components for teacher workflows in the KCAdashboard. Each component is:
- **Single-responsibility**: Handles only one UI concern (attendance, feedback, performance, etc.)
- **Beautiful & Responsive**: Uses the KCA color system, Tailwind, and modern layouts
- **Accessible**: ARIA roles, keyboard navigation, focus management
- **Performant**: Uses React.memo and minimal state

## Components

- **AttendanceModal.js**  
  Modal for marking student attendance. Features session selection, status, and notes. Fully responsive, accessible, and uses color tokens.

- **FeedbackModal.js**  
  Modal for submitting teacher feedback on a student. Includes star rating, comments, strengths, and areas for improvement. Beautiful, accessible, and responsive.

- **FeedbackHistoryModal.js**  
  Modal for viewing a student's feedback history. Displays all feedback entries with rating, comments, strengths, and improvement areas. Uses color tokens and modern layout.

- **PerformanceModal.js**  
  Modal for viewing a student's performance summary. Shows attendance, quiz performance, and recent feedback. Responsive, accessible, and visually appealing.

## Design & UX
- All modals use the KCA color system (see `colour_scheme.md`)
- Mobile-first, grid/flex layouts
- All interactive elements have focus/hover/disabled states
- ARIA roles and keyboard navigation for accessibility
- Transitions and animation for smooth UI

## Usage
Import and use these components in teacher dashboard and management pages. See each file for JSDoc and prop details.

---

_Last updated: July 14, 2025_
