# Admin Dashboard UI Components – KCAdashboard

## Overview

This folder contains all admin dashboard UI components. Each component is modular, single-responsibility, and designed for beauty, accessibility, and performance. All components use the color system from `colour_scheme.md` and follow the project's UI/UX and accessibility guidelines.

---

## Components

- **StatCard.js**  
  Beautiful, animated, accessible stat card for dashboard statistics. Uses color tokens, dark mode, and ARIA roles.

- **LoadingState.js**  
  Accessible, visually clear loading state for dashboard and admin pages. Uses color tokens, dark mode, and ARIA roles.

- **ErrorState.js**  
  Accessible, visually distinct error state for dashboard and admin pages. Uses color tokens, dark mode, and ARIA roles.

---

## Design & Accessibility

- All components use TailwindCSS and the project's color tokens.
- Fully responsive and accessible (ARIA, keyboard navigation, focus states).
- Each file does one job only and is imported where needed.
- All interactive elements have hover, focus, and active states.
- See `colour_scheme.md` for color usage and design system.

---

## Usage

Import and use these components in admin dashboard pages. See each file for prop details and usage examples.
