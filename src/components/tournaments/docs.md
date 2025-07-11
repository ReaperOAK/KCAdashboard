# Tournaments UI Components – Documentation

## Overview
This folder contains all modular UI components for the tournaments feature. Each file does one job only, following single responsibility and project coding standards.

## Component List
- `LoadingSpinner.js`: Accessible loading spinner for tournament pages.
- `ErrorState.js`: Error state with icon and message.
- `TournamentFilterBar.js`: Filter bar for tournament status, keyboard accessible.
- `RegistrationButton.js`: Handles registration/payment states and actions.
- `TournamentCard.js`: Card for displaying tournament details and actions.
- `PaymentModal.js`: Accessible modal for payment upload.

### Registration Management Subcomponents
- `RegistrationsSkeleton.js`: Loading spinner and message for registrations page
- `ErrorAlert.js`: Error message display for registrations
- `TournamentInfo.js`: Tournament info card (title, date, status, entry fee)
- `FilterExportBar.js`: Filter and export controls for registrations
- `RegistrationsTable.js`: Table of tournament registrations
- `PaymentModal.js`: Modal for payment screenshot/approval (shared)

All are used in `TournamentRegistrations.js` (see admin/docs.md for orchestration). Each is single-responsibility, memoized, and uses the color system.

## UI/UX & Accessibility
- All components use color tokens and design system.
- Responsive layouts for all screen sizes.
- Interactive elements have hover, focus, and active states.
- Uses Lucide icons for clarity.
- Modal is accessible (focus trap, ARIA roles).

## How to Extend
- Add new components here for new tournament UI features.
- Update this doc and `README.md` after changes.

## Last updated
2025-07-11: Major refactor for modularity, beauty, and accessibility.
