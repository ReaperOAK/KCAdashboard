<?php
// Session Management Configuration
// Adjust these settings based on your requirements

return [
    // Maximum concurrent sessions per user (0 = unlimited)
    'max_concurrent_sessions' => 0,
    
    // Session lifetime in hours
    'session_lifetime_hours' => 24,
    
    // Whether to automatically remove oldest session when limit is reached
    'auto_remove_old_sessions' => true,
    
    // Whether to notify users about new logins
    'notify_new_login' => false,
    
    // Session renewal threshold in minutes (renew if less than this time remaining)
    'renewal_threshold_minutes' => 30,
    
    // Settings by user role
    'role_settings' => [
        'student' => [
            'max_concurrent_sessions' => 3, // Students can use phone, tablet, computer
            'session_lifetime_hours' => 24,
        ],
        'teacher' => [
            'max_concurrent_sessions' => 5, // Teachers may need more devices
            'session_lifetime_hours' => 48,
        ],
        'admin' => [
            'max_concurrent_sessions' => 0, // Unlimited for admins
            'session_lifetime_hours' => 72,
        ]
    ]
];
?>
