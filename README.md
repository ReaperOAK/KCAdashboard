# Kolkata Chess Academy Dashboard

Welcome! KCAdashboard is a modern, beautiful, and accessible dashboard for the Kolkata Chess Academy.

## 🛠️ Quick Start

```powershell
cd c:\Owais\KCAdashboard; npm install; npm start
```


## 📝 July 2025 Update: Quiz Chess Move Feedback
Chess quiz questions now provide instant feedback for both correct and incorrect moves. Wrong moves are highlighted and users are prompted to try again, improving the learning experience for both FEN and PGN quiz modes.

## 📖 Where to Find Things

- [UI/UX, Design System, Accessibility](docs.md)
- [Feature Docs](src/components/docs.md)
- [API Docs](public/api/docs.md)
- [Contribution Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

---


## Registration & Role Security Policy (July 2025)

All new user registrations are created as **students**. Only administrators can promote users to teacher or admin roles via the user management interface. This prevents unauthorized access to teacher dashboards and ensures secure role management. See `CONTRIBUTING.md` and API docs for details.

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
- Quizzes created from PGNs now default to public visibility, so students can see them when published.
- Batch PGN-to-quiz creation also defaults to public visibility.
- Quiz Creator auto-detects PGN data and loads chess questions with full game content.
- See `src/hooks/usePGNQuizIntegration.js` and `src/components/chess/pgnlibrary/` for implementation details.

## 🆕 Recurring Classes Feature

Teachers can now schedule recurring classes based on batch schedules:
- Click "Recurring Classes" in Classroom Management to auto-generate sessions for weeks/months in advance.
- Uses batch schedule (days, time, duration) for session creation.
- Smart conflict detection, preview, and notifications for students.
- See `src/components/classroom/docs.md` and API docs for details.

# Quiz No-Retake Policy (July 2025)

- Once a quiz is submitted, students cannot retake it. No cooling time, no retry, no second attempt.
- All UI retry/retake options have been removed.
- Backend and frontend both enforce this rule for fairness and security.
- See `README-quiz-no-retake-policy.md` for full details.
