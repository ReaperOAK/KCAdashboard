# Leaderboard Components Documentation

## Overview
This folder contains highly focused, accessible, and visually beautiful React components for the leaderboard feature. All components are designed for:
- Single responsibility (each file does one job)
- Modern, responsive UI using Tailwind and the KCA color system
- Accessibility (ARIA, keyboard navigation, focus rings)
- Performance (React.memo, efficient rendering)

## Components

### ErrorState
- Displays a visually appealing error message with icon
- Uses ARIA roles and keyboard focus
- Responsive and theme-aware
- Usage:
  ```jsx
  <ErrorState message="Something went wrong!" />
  ```

### LoadingSpinner
- Shows a beautiful animated spinner and loading message
- Uses SVG and Tailwind for smooth animation
- Accessible (role="status", aria-live)
- Usage:
  ```jsx
  <LoadingSpinner />
  ```

### QuizFilterBar
- Renders a responsive, accessible filter bar for quizzes
- Uses color tokens, focus rings, and iconography
- Handles all screen sizes and keyboard navigation
- Usage:
  ```jsx
  <QuizFilterBar quizzes={quizzes} activeQuiz={activeQuiz} onQuizChange={setQuiz} />
  ```

### LeaderboardTable
- Renders a beautiful, responsive leaderboard table
- Handles empty states, top rank highlighting, and accessibility
- Usage:
  ```jsx
  <LeaderboardTable data={data} activeQuiz={activeQuiz} quizzes={quizzes} formatTime={formatTime} />
  ```

## Design & UX Notes
- All components use the color tokens and design system from `colour_scheme.md`.
- Focus on clarity, contrast, and smooth transitions.
- All interactive elements have hover, focus, and active states.
- Components are modular and can be reused elsewhere.

## Changelog
- July 2025: Major UI/UX refactor for leaderboard components. Improved accessibility, responsiveness, and visual polish. All code now follows KCA React and Tailwind guidelines.
