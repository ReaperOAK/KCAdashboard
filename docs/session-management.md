# Session Management Feature Documentation

## Overview

The KCAdashboard now includes comprehensive session management capabilities that allow users to view and manage their active sessions across multiple devices while providing administrators with flexible configuration options.

## Features

### For Users:
- **View Active Sessions**: See all current login sessions with timestamps and device information
- **Session Security**: Logout from specific devices or all other devices
- **Real-time Monitoring**: Track session activity and expiration times
- **Security Alerts**: Clear visibility of all active sessions for security monitoring

### For Administrators:
- **Role-based Limits**: Different session limits per user role (student, teacher, admin)
- **Configurable Timeouts**: Flexible session lifetimes based on user roles
- **Automatic Cleanup**: Option to automatically remove oldest sessions when limits are reached
- **Security Policies**: Enforce organizational security requirements

## Current Configuration

By default, the system is configured as follows:

### Session Limits by Role:
- **Students**: 3 concurrent sessions (phone, tablet, computer)
- **Teachers**: 5 concurrent sessions (multiple devices for teaching)
- **Admins**: Unlimited sessions

### Session Lifetimes:
- **Students**: 24 hours
- **Teachers**: 48 hours  
- **Admins**: 72 hours

### Auto-cleanup:
- Enabled: Oldest sessions are automatically removed when limits are reached
- Alternative: Reject new logins when limit is reached

## Benefits

### Security Benefits:
1. **Account Protection**: Users can detect unauthorized access
2. **Controlled Access**: Prevents excessive session proliferation
3. **Audit Trail**: Clear session history and activity tracking
4. **Forced Logout**: Ability to terminate suspicious sessions

### User Experience Benefits:
1. **Multi-device Support**: Use account across different devices seamlessly
2. **Flexibility**: Students can start work on phone, continue on computer
3. **Family Access**: Parents can monitor while students study
4. **Convenience**: No forced logouts when switching devices

### Educational Benefits:
1. **Continuity**: Seamless learning across devices
2. **Accessibility**: Access from home, school, library computers
3. **Collaboration**: Teachers can demo on one device while monitoring on another
4. **Parental Involvement**: Parents can check progress without interrupting study

## Technical Implementation

### Backend Files:
- `login.php` - Enhanced with role-based session management
- `logout.php` - Server-side token invalidation
- `get-active-sessions.php` - Session listing API
- `manage-sessions.php` - Session management operations
- `session-config.php` - Configuration file for session policies

### Frontend Components:
- `SessionManager.js` - React component for session management UI
- `SecuritySettings.js` - Page containing session management features
- Enhanced `useAuth.js` hook with logout functionality

### Database:
- `auth_tokens` table stores all session information
- Automatic cleanup of expired tokens
- Session tracking with creation and expiration timestamps

## Customization

To modify session behavior, edit `/public/api/config/session-config.php`:

```php
'max_concurrent_sessions' => 0,  // 0 = unlimited
'session_lifetime_hours' => 24,
'auto_remove_old_sessions' => true,
'role_settings' => [
    'student' => ['max_concurrent_sessions' => 3],
    'teacher' => ['max_concurrent_sessions' => 5],
    'admin' => ['max_concurrent_sessions' => 0]
]
```

## Recommendation

For the KCAdashboard educational platform, the current configuration (allowing multiple sessions) is optimal because:

1. **Educational Context**: Students naturally use multiple devices
2. **Family Involvement**: Parents want to monitor progress
3. **Teaching Requirements**: Teachers need flexibility for demonstrations
4. **User Experience**: Seamless transitions between devices improve learning

The session management system provides security controls while maintaining the flexibility needed for an effective educational platform.
