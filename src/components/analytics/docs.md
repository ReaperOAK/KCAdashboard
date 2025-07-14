# Analytics Components – KCAdashboard

## July 2025 Refactor

All analytics dashboard UI and components have been refactored for a beautiful, modern, and accessible user experience:
- Modular, single-responsibility React components
- Fully responsive layouts for all screen sizes
- Consistent use of Tailwind color tokens and the design system (see `colour_scheme.md`)
- Accessibility: ARIA roles, keyboard navigation, focus/hover/active states
- Performance: React.memo, useCallback, useMemo, and lazy loading for all heavy/chart components
- All files are imported and registered in `PlatformAnalytics.js` and used in the analytics dashboard

## Components

- **PlatformAnalytics.js**  
  Main analytics dashboard page. Handles loading, error, and empty states. Lazy-loads all analytics components for performance. Fully responsive and accessible.
- **AnalyticsSkeleton.js**  
  Beautiful, responsive loading skeleton for analytics dashboards. Uses shimmer animation, color tokens, and ARIA roles for accessibility.
- **ErrorAlert.js**  
  Accessible, visually distinct error alert with icon, accent border, and retry button. Handles error, loading, and empty states.
- **TimeRangeSelect.js**  
  Accessible, beautiful select dropdown for time range filtering. Features accent border, dropdown icon, and smooth transitions.
- **UserGrowthChart.js**  
  Responsive, accessible line chart for user growth. Uses color tokens, improved legend, and ARIA roles.
- **UserActivityChart.js**  
  Responsive, accessible bar chart for user activity. Uses color tokens, improved legend, and ARIA roles.
- **PerformanceMetricsChart.js**  
  Responsive, accessible pie chart for performance metrics. Uses color tokens, improved legend, and ARIA roles.

---

## Design & Accessibility

- All components use TailwindCSS and the project's color tokens.
- Fully responsive and accessible (ARIA, keyboard navigation, focus states).
- Each file does one job only and is imported where needed.
- All interactive elements have hover, focus, and active states.
- See `colour_scheme.md` for color usage and design system.
- All chart components are lazy-loaded for performance.

---

## Usage

Import and use these components in analytics pages or dashboards. See each file for prop details and usage examples.
