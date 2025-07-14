
# KCAdashboard Frontend – Utils Documentation

## Overview

The `utils` folder contains utility modules and helper functions used throughout the KCAdashboard frontend. These utilities provide core logic for API communication, chess engine integration, permissions management, PGN file handling, and file uploads. By centralizing shared logic, the utils folder helps keep components and pages clean and maintainable.

---

## File Structure

```
utils/
  api.js                # Handles API requests and communication
  ChessEngine.js        # Chess engine logic and integration
  ChessEngineFactory.js # Factory for creating chess engine instances
  KCAEngine.js          # Custom chess engine implementation
  OnlineChessEngine.js  # Integrates with online chess engines
  permissions.js        # Manages user permissions and roles
  pgnApi.js             # Handles PGN file operations and API calls
  StockfishOnlineAPI.js # Integrates with the Stockfish chess engine online
  uploadUtils.js        # Utility functions for file uploads
  formatSchedule.js     # Formats schedule objects/strings for display
- **formatSchedule.js**  
  Utility to format schedule JSON strings or objects into a user-friendly string for display in the UI. Used by all components that show batch or classroom schedules. Example output: `Mon, Wed, Fri, 09:00 for 60 min`.
- **Schedule Formatting:** Ensures all schedules are displayed in a readable, user-friendly format across the UI.
- Use `formatSchedule` to display any schedule data in a readable format.
**Schedule Formatting:**
```
import { formatSchedule } from '../utils/formatSchedule';
const readable = formatSchedule(batch.schedule);
```
- Use `formatSchedule` for all schedule displays to ensure consistency and readability.
- **Schedule formatting issues:** Ensure schedule data is a valid JSON string or object with `days`, `time`, and `duration` fields.
```

---

## File Explanations

- **api.js**  
  Centralized API service for making HTTP requests to the backend. Handles authentication tokens, error handling, and request/response formatting.

- **ChessEngine.js**  
  Contains logic for interacting with chess engines, including move validation, board state management, and engine communication.

- **ChessEngineFactory.js**  
  Factory module for creating instances of different chess engines (e.g., Stockfish, KCAEngine, OnlineChessEngine) based on configuration or user choice.

- **KCAEngine.js**  
  Custom chess engine implementation tailored for the KCAdashboard platform. Provides move generation, evaluation, and game logic.

- **OnlineChessEngine.js**  
  Integrates with online chess engines or APIs to enable cloud-based chess analysis and gameplay.

- **permissions.js**  
  Manages user permissions and roles, providing helper functions to check access rights and enforce role-based logic.

- **pgnApi.js**  
  Handles operations related to PGN (Portable Game Notation) files, including parsing, uploading, downloading, and API calls for chess game data.

- **StockfishOnlineAPI.js**  
  Integrates with the Stockfish chess engine running online, enabling advanced analysis and move suggestions.

- **uploadUtils.js**  
  Utility functions for handling file uploads, including validation, formatting, and API integration.

---

## Features

- **Centralized API Logic:** Consistent and secure communication with the backend.
- **Chess Engine Abstraction:** Easily switch between different chess engines or add new ones.
- **Role & Permission Management:** Enforce access control throughout the app.
- **PGN File Handling:** Robust support for chess game data import/export.
- **Reusable Upload Logic:** Simplifies file upload workflows across the app.

---

## How These Utilities Work

- Import utility modules where needed in components, hooks, or pages.
- Use the API service for all backend communication to ensure consistent error handling and token management.
- Use the chess engine factory to instantiate the desired engine for gameplay or analysis.
- Use permission helpers to guard routes and UI elements based on user roles.

---

## Example Usage

**API Request:**
```
import ApiService from '../utils/api';
const data = await ApiService.get('/endpoint');
```

**Chess Engine Factory:**
```
import ChessEngineFactory from '../utils/ChessEngineFactory';
const engine = ChessEngineFactory.create('stockfish');
```

**Permission Check:**
```
import { hasPermission } from '../utils/permissions';
if (hasPermission(user, 'admin')) { /* ... */ }
```

---

## Best Practices

- Keep utility modules focused and single-purpose for maximum reusability.
- Centralize API logic to simplify error handling and authentication.
- Use factories and abstraction layers to support extensibility (e.g., new chess engines).
- Document utility functions and expected parameters for maintainability.

---

## Troubleshooting

- **API errors:** Check request formatting, authentication tokens, and backend availability.
- **Chess engine issues:** Ensure the correct engine is instantiated and all dependencies are loaded.
- **Permission problems:** Verify user roles and permission logic in `permissions.js`.
- **File upload failures:** Validate file types and sizes before uploading; check API endpoints.

---

For more details on utility usage and integration, see the main `docs.md` in the `src` folder.
