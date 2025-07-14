# Resource Center Components (July 2025 Refactor)

## Overview
All resource center UI is now modular, beautiful, and accessible. Components are single-responsibility, responsive, and use the KCA color system from `colour_scheme.md`.

## Components
- **CategoryTabs.js** – Responsive, accessible tab navigation for resource categories.
- **DetailsBody.js** – Main content/details for a resource, with tag badges and responsive grid.
- **DetailsHeader.js** – Header for resource details, with bookmark button and meta info.
- **EmptyState.js** – Accessible, icon-based empty state for no resources.
- **ErrorState.js** – Prominent error message with icon for error states.
- **FeaturedResources.js** – Section for featured resources, responsive grid.
- **LoadingSpinner.js** – Accessible animated spinner for loading states.
- **ResourceCard.js** – Card for individual resource, with bookmark, badges, and meta info.
- **ResourceDetailsEmptyState.js** – Empty state for missing resource details, with action button.
- **ResourceDetailsErrorState.js** – Error state for resource details, with action button.
- **SearchBar.js** – Accessible, beautiful search input for resources.
- **UploadResourceForm.js** – Responsive, accessible upload form using Formik/Yup.
- **VideoEmbed.js** – Responsive, accessible YouTube embed with fallback.

## Design & UX
- All components use Tailwind color tokens and spacing.
- Fully responsive (mobile-first, grid/flex layouts).
- Accessible: ARIA roles, keyboard navigation, focus/hover/disabled states.
- All interactive elements have transitions and clear states.
- Error, loading, and empty states feature icons and improved clarity.

## Usage
Import and compose these components in `ResourceCenter.js` and related pages. See each file for prop details and usage examples.

---

_Last updated: July 2025 – Major UI/UX refactor for resource center components._
