### MoveTimer.js
Accessible, beautiful timer for per-move countdown in PvP games. Uses color tokens and ARIA live region. Props: `timeLeft`, `formatTimer`.

### GameStatus.js
Shows current turn and timer with icon and color. Uses color tokens, transitions, and ARIA live. Props: `yourTurn`, `timeLeft`, `formatTimer`.
# KCAdashboard Frontend – Chess Components Documentation

## Overview

The `chess` subfolder under `components` contains React components related to chess gameplay, analysis, and management in KCAdashboard. These components support real-time chess games, PGN file handling, engine analysis, and player management for students, teachers, and admins.

---

## File Structure

```
components/chess/
  AcceptedGamesModal.js    # Modal displaying accepted chess games
  ChallengeList.js         # Lists chess challenges
  ChessBoard.js            # Main chessboard component for gameplay
  ChessNavigation.js       # Navigation controls for chess games
  ChessPGNBoard.js         # Displays chess games from PGN files (quiz mode: instant feedback for correct/incorrect moves)
  ChessPositionEditor.js   # Allows editing of chess positions
  ChessQuizBoard.js        # Board for chess quiz questions (instant feedback for correct/incorrect moves)
  EngineAnalysis.js        # Provides chess engine analysis features
  MoveHistory.js           # Shows move history for a game
  PGNLibrary.js            # Manages a library of PGN files
  PGNUpload.js             # Handles uploading of PGN files (max 50 games per upload)
  PGNViewer.js             # Viewer for PGN chess games (auto-limits to 50 games for performance)
  PlayerList.js            # Lists players in the chess section
```

---


## PlayerVsPlayer Modular Subcomponents (July 2025)

### TabButton.js
Memoized tab button for navigation tabs. Props: `isActive`, `onClick`, `children`, `badge`, `ariaLabel`.

### LoadingState.js
Displays a centered loading indicator for async states.

### ErrorState.js
Displays an error message and retry button. Props: `error`, `onRetry`.

### ComputerSettings.js
Settings panel for "Play Computer" tab. Props: `engineLevel`, `setEngineLevel`, `engineColor`, `setEngineColor`, `useOnlineAPI`, `setUseOnlineAPI`.

### StatsPanel.js
Displays user chess statistics and recent games. Prop: `playerStats`.

---
These components are used in `PlayerVsPlayer.js` for modularity, reusability, and design system compliance.

- **AcceptedGamesModal.js**  
  Modal dialog displaying a list of accepted chess games for the user.

- **ChallengeList.js**  
  Lists all current chess challenges, both sent and received.

- **ChessBoard.js**  
  Main chessboard component for real-time gameplay and move interaction.

- **ChessNavigation.js**  
  Provides navigation controls (e.g., next/prev move) for chess games.

**ChessPGNBoard.js**  
  Displays chess games loaded from PGN files for review or study. In quiz mode, provides instant feedback for correct and incorrect moves, and reports all moves (correct/incorrect) to parent components for quiz scoring.

- **ChessPositionEditor.js**  
  Allows users to edit and set up custom chess positions.

**ChessQuizBoard.js**  
  Board component for chess quiz questions and puzzles. Now provides instant feedback for both correct and incorrect moves. Wrong moves are highlighted and users are prompted to try again. All moves (correct/incorrect) are reported to parent components for quiz scoring.

- **DrawOfferDialog.js**  
  Modal component for offering and responding to draw offers in player vs player games. Handles draw negotiations and automatically ends games when draws are mutually agreed upon.

- **DrawOfferToast.js**  
  Toast notification component that appears when draw offers are received, providing quick accept/decline actions without opening the full dialog.

- **EngineAnalysis.js**  
  Integrates with a chess engine to analyze games and suggest moves.

- **MoveHistory.js**  
  Shows the move history for a given chess game.

- **PGNLibrary.js**  
  Manages a library of PGN files for browsing and selection.

- **PGNUpload.js**  
  Handles uploading of PGN files for analysis or record-keeping.

- **PGNViewer.js**  
  Viewer for displaying and navigating PGN chess games.

- **PlayerList.js**  
  Lists players in the chess section, supporting player selection and management.

---

## How These Components Work

- Components are imported and used in chess-related pages and features.
- They interact with the backend via API calls for game state, analysis, and player data.
- Designed to be reusable and composable for chess workflows.

---

## Example Usage

- Users play games using `ChessBoard.js` and review games with `PGNViewer.js`.
- Teachers assign quizzes using `ChessQuizBoard.js` and analyze games with `EngineAnalysis.js`.
- Players upload and manage PGN files with `PGNUpload.js` and `PGNLibrary.js`.

---

## Best Practices

- Keep components focused and reusable.
- Document component props and usage for maintainability.
- Use modular design for chess features to support future expansion.

---

## PGN 50-Game Limit (July 2025)

### Performance Safety Measures
To prevent application hanging and ensure smooth user experience, PGN files are limited to 50 games:

- **Upload Limit**: New PGN uploads are restricted to maximum 50 games per file
- **Frontend Validation**: PGN parser checks game count before processing
- **Backend Validation**: Server-side validation prevents large PGN uploads
- **Viewer Safety**: PGN viewer automatically limits display to first 50 games
- **Existing Files**: Large PGN files already in the database are truncated to 50 games when viewed

### Components Affected
- `PGNUpload.js`: Validates game count in both manual and automatic parsers
- `PGNViewer.js`: Limits display to 50 games with warning message
- `PGNFileDrop.js`: Shows warning about 50-game limit
- Backend endpoints: `upload-pgn.php`, `validate-pgn.php`, `get-game.php`

---

## PGN Management Modular Subcomponents (August 2025)

### FeatureHighlights.js
Highlights PGN features for the management page. Uses color tokens and is fully responsive.

### TabNav.js
Tab navigation for chess pages. Now supports both dynamic (PGN management) and legacy (static) tab modes. Uses color tokens, icons, and ARIA roles for accessibility.

### QuickActions.js
Quick start actions for PGN management. Uses design tokens and is fully responsive.

### UploadHelpSection.js
PGN format help for uploads. Uses design tokens and is fully responsive.

---

For more details on the overall frontend structure, see the main `docs.md` in the `src` folder.
