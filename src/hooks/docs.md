

# KCAdashboard Frontend – Custom Hooks Documentation

## July 2025 Student UI/UX Overhaul
- All hooks used in student-facing pages (authentication, analytics, chess data, resources, etc.) have been reviewed and refactored for:
  - Modular, single-responsibility logic
  - Performance: useCallback, useMemo, and minimal re-renders
  - Accessibility and state management best practices
  - Consistent usage across all student dashboard and page components

## Overview

The `hooks` folder contains custom React hooks that encapsulate reusable logic for authentication, analytics, and other cross-cutting concerns in the KCAdashboard frontend. These hooks help keep components clean and focused by abstracting complex or repetitive logic into easy-to-use functions.

---

## File Structure

```
hooks/
  useAuth.js     # Authentication context and hook
  usePGNView.js  # Hook for recording PGN chess game views
```

---

## File Explanations

- **useAuth.js**  
  Provides an authentication context and custom hook for managing user authentication state, login, registration, logout, password reset, and profile updates. Handles token storage, validation, and user persistence using localStorage. Exposes all auth-related functions and state to the rest of the app via React Context.

- **usePGNView.js**  
  Custom hook for recording when a user views a PGN (chess game) for analytics. Delays recording to ensure the user actually views the game, and provides a manual record function. Useful for tracking engagement with chess content.

---

## Features

- **Centralized Authentication:** Manage user state, login, registration, logout, and profile updates from anywhere in the app.
- **Token Management:** Automatically validates and persists tokens; handles expiration and invalidation.
- **Password Reset:** Request and perform password resets via API.
- **PGN View Analytics:** Record chess game views with a delay to avoid false positives; supports manual and automatic recording.
- **Reusable Logic:** Hooks are designed to be imported and used in any component, promoting DRY code.

---

## How These Hooks Work

- `useAuth` provides access to the current user, token, and all authentication methods. Wrap your app in `AuthProvider` to enable context.
- `usePGNView` is called with a game ID and options; it records a view after a delay or when manually triggered.

---

## Example Usage

**Authentication:**
```
import { useAuth, AuthProvider } from '../hooks/useAuth';

// In your App.js or index.js
<AuthProvider>
  <App />
</AuthProvider>

// In a component
const { user, login, logout } = useAuth();
```

**PGN View Analytics:**
```
import usePGNView from '../hooks/usePGNView';

const { isRecorded, recordView } = usePGNView(gameId, { enabled: true, delay: 2000 });
```

---

## Best Practices

- Keep hooks focused on a single responsibility for maximum reusability.
- Always wrap your app in `AuthProvider` to use `useAuth` throughout the component tree.
- Use the options in `usePGNView` to fine-tune analytics behavior and avoid unnecessary API calls.
- Handle errors from hooks gracefully in your UI.

---

## Troubleshooting

- **Auth state not updating:** Ensure your components are wrapped in `AuthProvider` and you're using the hook, not the context directly.
- **PGN views not recording:** Check that the game ID is valid and the API is reachable; adjust the delay if needed.
- **Token issues:** Make sure tokens are stored and cleared correctly in localStorage; check for API errors on login/logout.

---

For more details on custom hooks and advanced usage, see the main `docs.md` in the `src` folder.
