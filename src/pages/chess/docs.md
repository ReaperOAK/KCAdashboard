# KCAdashboard Frontend – Chess Pages Documentation

## [2025-07-05] PvP Chess Timer Fix

- The per-move countdown timer in PvP chess now resets and synchronizes instantly after each move. The timer is updated from the backend response, ensuring both players see the correct time left for their move without delay.
- See `InteractiveBoard.js` for implementation details.

## Overview

The `chess` folder under `pages` contains all top-level page components related to chess features in the KCAdashboard application. These pages provide interfaces for playing chess, managing PGN files, and supporting different gameplay modes. They are designed for both casual and competitive chess experiences, as well as for managing and analyzing chess games.

---

## File Structure

```
pages/chess/
  ChessHome.js          # Home page for chess features
  GameArea.js           # Main game area for playing chess
  InteractiveBoard.js   # Interactive chessboard for gameplay
  PGNManagementPage.js  # Page for managing and analyzing PGN files
  PGNGameView.js        # Page for viewing a single PGN game in detail
  PlayerVsPlayer.js     # Player vs player chess mode
```

---

## File Explanations

- **ChessHome.js**  
  The landing page for all chess-related features. Provides navigation to play, analyze, or manage chess games.

- **GameArea.js**  
  The main area for playing chess games, including single-player and AI modes. Handles game state, move validation, and user interactions.

- **InteractiveBoard.js**  
  An interactive chessboard component for gameplay. Supports drag-and-drop moves, highlighting, and real-time updates.

- **PGNManagementPage.js**  
  Interface for uploading, viewing, and managing PGN (Portable Game Notation) files. Allows users to analyze past games and share PGNs.

- **PGNGameView.js**  
  Displays a single chess game in PGN format. Uses color tokens, beautiful card layout, and accessible error/loading states. Navigation button returns to the PGN library. Fully responsive and single-responsibility.

- **PlayerVsPlayer.js**  
  Dedicated mode for player-vs-player chess games, either locally or online. Manages turns, timers, and game results.

---

## Features

- **Multiple Game Modes:** Supports single-player, player-vs-player, and AI chess games.
- **PGN Management:** Upload, view, and analyze chess games using PGN files.
- **Interactive UI:** Drag-and-drop chessboard, move highlighting, and real-time feedback.
- **Game Analysis:** Tools for reviewing and sharing chess games.
- **Seamless Navigation:** ChessHome provides easy access to all chess features.

---

## How These Pages Work

- Each page is mapped to a chess-related route (e.g., `/chess`, `/chess/play`, `/chess/pgn`).
- Pages fetch and manage game data, user moves, and PGN files as needed.
- Components are composed for modularity and reusability across chess features.

---

## Example Usage

**Chess Home Route:**
```
import ChessHome from './pages/chess/ChessHome';
<Route path="/chess" element={<ChessHome />} />
```

**PGN Management Route:**
```
import PGNManagementPage from './pages/chess/PGNManagementPage';
<Route path="/chess/pgn" element={<PGNManagementPage />} />
```

---

## Best Practices

- Keep game logic and state management in dedicated components or hooks.
- Validate all user moves and PGN uploads for integrity.
- Use modular components for chessboard, timers, and controls.
- Provide clear feedback and error messages for invalid actions.

---

## Troubleshooting

- **Game not starting:** Check game state initialization and route configuration.
- **PGN not loading:** Ensure file format is correct and API endpoints are reachable.
- **Board not interactive:** Verify event handlers and component props.

---

## Student Upload Restriction

- Students are not allowed to upload PGN files. The upload tab is hidden for student users, and the backend will also reject upload attempts from students.
- Teachers and admins retain full access to PGN upload features.

---

For more details on chess features and integration, see the main `docs.md` in the `src` folder.
