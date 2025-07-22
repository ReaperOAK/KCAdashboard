# Kolkata Chess Academy Dashboard

Welcome! KCAdashboard is a modern, beautiful, and accessible dashboard for the Kolkata Chess Academy.

## 🛠️ Quick Start

```powershell
cd c:\Owais\KCAdashboard; npm install; npm start
```

## 📖 Where to Find Things

- [UI/UX, Design System, Accessibility](docs.md)
- [Feature Docs](src/components/docs.md)
- [API Docs](public/api/docs.md)
- [Contribution Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---

For all project details, see the docs above.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

## Design System

This project uses a custom color system defined in `colour_scheme.md` and `tailwind.config.js`. All UI components are built with Tailwind utility classes and follow the design system for consistency, accessibility, and visual clarity.

### Color Tokens

See `colour_scheme.md` for the full palette and usage guide.

### UI/UX Principles

- Responsive layouts for all screen sizes
- Accessible components (ARIA, keyboard navigation, visually hidden text)
- Consistent spacing, typography, and color usage
- Visual hierarchy and clarity
- Loading, error, and empty states handled in all major components
- Iconography for actions and statuses

## Contributing

See `CONTRIBUTING.md` for guidelines.

## Changelog

See `CHANGELOG.md` for release notes.

## ♟️ PGN to Quiz Integration (July 2025)

- Teachers/admins can now create quizzes directly from PGN games in the Chess Library.
- Supports both single and batch PGN-to-quiz conversion, including batch selection and quiz creation modals.
- Quiz Creator auto-detects PGN data and loads chess questions with full game content.
- See `src/hooks/usePGNQuizIntegration.js` and `src/components/chess/pgnlibrary/` for implementation details.
