# Tournaments UI Components

This folder contains modular, single-responsibility React components for the tournaments feature. Each component is designed for reusability, accessibility, and beautiful, responsive UI/UX using the project's color tokens and design system.

## Components
- **LoadingSpinner.js** – Accessible animated spinner for loading states.
- **ErrorState.js** – Prominent error message with icon for error states.
- **TournamentFilterBar.js** – Filter bar for tournament status (all, upcoming, ongoing, completed), keyboard accessible.
- **RegistrationButton.js** – Handles all registration/payment states and actions.
- **TournamentCard.js** – Beautiful, responsive card for displaying tournament details and actions.
- **PaymentModal.js** – Accessible modal for payment upload, with focus trap and ARIA roles.

## Usage
Import and use these components in your tournament pages (e.g., `TournamentsPage.js`).

## Design & Accessibility
- Uses Tailwind color tokens and design system.
- All interactive elements have hover, focus, and active states.
- Fully responsive and accessible (ARIA, keyboard navigation).
- Icons from Lucide for visual clarity.

## Maintenance
- Update this doc when adding or changing components.
- See main project `README.md` for global standards.
