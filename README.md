# Kolkata Chess Academy Dashboard


## � July 2025: Settings Page, Session Management & Backend Robustness

- **Settings Page**: Added a dedicated Settings page accessible from the sidebar and user dropdown. Users can now manage their account security and active sessions from one place.
- **Session Management**: Users can view all active login sessions, log out from other devices, and monitor session activity for enhanced security. Session limits and durations are role-based and configurable by admins.
- **Backend Robustness**: Improved PHP backend to use absolute paths for session config, added error handling and output buffering to prevent PHP warnings from breaking JSON responses, and enhanced frontend parsing of API responses with PHP warnings. This ensures reliable session management and authentication even if server warnings occur.

See [`docs/session-management.md`](docs/session-management.md) for full details.

Welcome! KCAdashboard is a modern, beautiful, and accessible dashboard for the Kolkata Chess Academy.

## 🛠️ Quick Start

```powershell
cd c:\Owais\KCAdashboard; npm install; npm start
```


## 📝 July 2025 Update: Quiz Chess Move Feedback
Chess quiz questions now provide instant feedback for both correct and incorrect moves. Wrong moves are highlighted and users are prompted to try again, improving the learning experience for both FEN and PGN quiz modes.

## 🆕 July 2025: Show/Hide Password Option
All authentication forms (Login, Register, Reset Password) now include a "Show Password" toggle for better usability. A reusable `PasswordInput` component is available for use in any form. See `src/components/common/PasswordInput.js` and `FormikPasswordField.js` for details.

## 🟢 July 2025 Update: Teacher Attendance Batch Selection
Teachers no longer need to manually select a batch before marking attendance. The system now automatically determines the batch from the student being marked, streamlining the attendance process and preventing errors.

## ⚠️ July 2025 Update: PGN Upload 50-Game Limit
To prevent performance issues and application hanging, PGN uploads are now limited to a maximum of 50 games per file. This ensures smooth user experience when uploading and viewing PGN files. Existing large PGN files (like the 3K games file) are automatically truncated to the first 50 games when viewed.

## 🟢 July 2025 Update: Grading Workflow & Pending Grading Modal Fix


## 🆕 July 2025: Student Dashboard Quick Links
The Student Dashboard now features prominent navigation cards for "Feedback & Grading" and "Report Cards". These cards provide students with one-click access to their feedback history and academic performance reports, improving discoverability and navigation. The cards are fully accessible, responsive, and follow the KCA design system.



## 🟢 July 2025: Teacher Dashboard React Key Bugfix & List Rendering Robustness

- Fixed: All React lists in the Teacher Dashboard now use robust, unique keys to prevent duplicate/empty key warnings and ensure stable UI updates.
- Improved: All mapped lists (modals, stats, activities) now have fallback keys for edge cases, eliminating React key warnings and improving dashboard reliability.

## 🆕 Teacher Leave Requests (July 2025)

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

## User Menu & Profile/Logout Dropdown (July 2025)

The top navigation bar features a user menu with a dropdown containing "Profile" and "Logout" actions. The dropdown is fully accessible (keyboard, ARIA, focus management), and only appears when clicking the user avatar. All actions are handled inside the dropdown for clarity and accessibility.

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

## 🆕 Enhanced Profile System (July 2025)

- FIDE ID integration: Add and link to official FIDE profiles
- Rating management: FIDE and national ratings, with validation
- Mandatory profile picture uploads for all users
- Mandatory date of birth certificate upload for students
- Admin document verification workflow
- Role-based profile fields (students, teachers/coaches)
- See [ENHANCED_PROFILE_DOCUMENTATION.md](ENHANCED_PROFILE_DOCUMENTATION.md) for full details

## July 2025: Multiple File Upload for Classroom Materials

- Teachers can now upload multiple files at once as classroom materials.
- Each file is validated (type, size) and creates a separate resource entry.
- UI shows selected file count and names, and supports mixed uploads (files + video links).
- See `material-upload-fix-summary.md` for details.

# Quiz No-Retake Policy (July 2025)

- Once a quiz is submitted, students cannot retake it. No cooling time, no retry, no second attempt.
- All UI retry/retake options have been removed.
- Backend and frontend both enforce this rule for fairness and security.
- See `README-quiz-no-retake-policy.md` for full details.

## July 2025 Update: Class Scheduling Improvements

- Teachers can no longer schedule classes in the past (UI and backend validation).
- All class/session date logic now uses IST (Asia/Kolkata) timezone for accuracy.
- Improved error handling for scheduling attempts with invalid dates.

# Chess Draw Offers Feature

This release adds the ability for players to offer, accept, and decline draw offers in player vs player chess games.

## Key Features
- Offer Draw: Players can offer a draw during an active game
- Accept/Decline: Opponents can accept or decline draw offers
- Automatic acceptance if both players offer draws
- Draw offers expire after 5 minutes
- Real-time notifications and toast alerts
- Game statistics updated for draws

## Database Changes
- New table: `chess_draw_offers` (see `database_migrations/add_chess_draw_offers_table.sql`)

## API Endpoints
- `POST /api/chess/offer-draw.php` — Offer a draw
- `POST /api/chess/respond-draw.php` — Accept/decline a draw offer
- `GET /api/chess/get-draw-offers.php?game_id=...` — List pending draw offers

## Frontend
- New components: DrawOfferDialog, DrawOfferToast, BrowserNotification
- ChessBoard integration: "Offer Draw" button, polling, and notifications

See `README-draw-offers.md` for full details.
