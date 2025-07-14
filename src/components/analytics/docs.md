# Analytics Components – KCAdashboard

## Overview

This folder contains all analytics-related UI components for the Kolkata Chess Academy Dashboard. Each component is modular, single-responsibility, and designed for beauty, accessibility, and performance. All components use the color system from `colour_scheme.md` and follow the project's UI/UX and accessibility guidelines.

---

## Components

- **AnalyticsSkeleton.js**  
  Beautiful, responsive loading skeleton for analytics dashboards. Uses shimmer animation, color tokens, and ARIA roles for accessibility.

- **ChartCard.js**  
  Modular card container for charts and stats. Features accent border, shadow, and responsive design.

- **ErrorAlert.js**  
  Accessible, visually distinct error alert with icon, accent border, and retry button. Handles error, loading, and empty states.

- **ExportModal.js**  
  Responsive, accessible modal for exporting analytics data. Features accent border, smooth animation, and dark mode support.

- **LoadingSkeleton.js**  
  Dual-color animated spinner for loading states. Fully accessible and responsive.

- **PerformanceMetricsChart.js**  
  Responsive, accessible pie chart for performance metrics. Uses color tokens, improved legend, and ARIA roles.

- **QuickStats.js**  
  Beautiful, modular quick stats grid with icons, accent borders, and responsive layout.

- **TimeRangeSelect.js**  
  Accessible, beautiful select dropdown for time range filtering. Features accent border, dropdown icon, and smooth transitions.

- **UserActivityChart.js**  
  Responsive, accessible bar chart for user activity. Uses color tokens, improved legend, and ARIA roles.

- **UserGrowthChart.js**  
  Responsive, accessible line chart for user growth. Uses color tokens, improved legend, and ARIA roles.

---

## Design & Accessibility

- All components use TailwindCSS and the project's color tokens.
- Fully responsive and accessible (ARIA, keyboard navigation, focus states).
- Each file does one job only and is imported where needed.
- All interactive elements have hover, focus, and active states.
- See `colour_scheme.md` for color usage and design system.

---

## Usage

Import and use these components in analytics pages or dashboards. See each file for prop details and usage examples.
