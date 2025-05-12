# Kolkata Chess Academy Dashboard - JavaScript Documentation

This document provides details about all JavaScript files in the KCA Dashboard application, organized by their location in the project structure.

## Table of Contents

- [Components](#components)
  - [Batches](#batches)
  - [Chess](#chess)
  - [Classroom](#classroom)
  - [Common](#common)
  - [PGN Database](#pgn-database)
  - [User Management](#user-management)
  - [Other Components](#other-components)
- [Hooks](#hooks)
- [Pages](#pages)
  - [Admin](#admin)
  - [Auth](#auth)
  - [Chess](#chess-1)
  - [Student](#student)
  - [Teacher](#teacher)
  - [Notifications](#notifications)
  - [Other Pages](#other-pages)
- [Routes](#routes)
- [Utils](#utils)
- [App Files](#app-files)

---

## File Structure
```
└── 📁src
    └── 📁components
        └── 📁batches
            └── BatchList.js
            └── CreateBatchForm.js
            └── StudentSearch.js
        └── Breadcrumbs.js
        └── 📁chess
            └── ChallengeList.js
            └── ChessBoard.js
            └── ChessNavigation.js
            └── EngineAnalysis.js
            └── MoveHistory.js
            └── PlayerList.js
            └── SimulBoard.js
        └── 📁classroom
            └── AttendanceModal.js
            └── ClassroomCalendar.js
            └── MaterialsView.js
        └── 📁common
            └── Modal.js
        └── ErrorBoundary.js
        └── ExportButton.js
        └── 📁LichessPgnViewer
            └── fallback.js
            └── index.js
        └── NotificationBell.js
        └── 📁PGNDatabase
            └── PGNCard.js
            └── PGNList.js
            └── ShareModal.js
            └── UploadModal.js
        └── ResourcePreview.js
        └── Sidebar.js
        └── 📁student
            └── QuizCard.js
        └── TopNavbar.js
        └── 📁user-management
            └── Filters.js
            └── 📁Modals
                └── EditUserModal.js
            └── UserTable.js
            └── UserTableRow.js
    └── 📁hooks
        └── useAuth.js
    └── 📁pages
        └── 📁admin
            └── AdminDashboard.js
            └── AttendanceSettings.js
            └── AttendanceSystem.js
            └── BatchManagement.js
            └── NotificationManagement.js
            └── PlatformAnalytics.js
            └── StudentAttendanceHistory.js
            └── StudentAttendanceList.js
            └── SupportSystem.js
            └── TournamentManagement.js
            └── TournamentRegistrations.js
            └── UserActivity.js
            └── UserActivityPage.js
            └── UserAttendanceReport.js
            └── UserManagement.js
        └── 📁auth
            └── Login.js
            └── Register.js
            └── ResetPassword.js
        └── 📁chess
            └── ChessHome.js
            └── ChessStudies.js
            └── GameArea.js
            └── InteractiveBoard.js
            └── PlayerVsPlayer.js
            └── SimulGames.js
        └── 📁notifications
            └── NotificationPreferences.js
        └── PGNViewer.js
        └── Profile.js
        └── 📁student
            └── ClassroomDetails.js
            └── ClassroomPage.js
            └── LeaderboardPage.js
            └── QuizDetailPage.js
            └── QuizHistoryPage.js
            └── QuizPage.js
            └── QuizResultsPage.js
            └── ResourceCenter.js
            └── ResourceDetails.js
            └── StudentDashboard.js
            └── TournamentsPage.js
        └── 📁teacher
            └── BatchDetail.js
            └── BatchManagement.js
            └── ClassroomDetail.js
            └── ClassroomManagement.js
            └── GradingFeedback.js
            └── PGNDatabase.js
            └── QuizCreator.js
            └── QuizManagement.js
            └── ReportsAnalytics.js
            └── TeacherDashboard.js
    └── 📁routes
        └── adminRoutes.js
        └── chessRoutes.js
        └── studentRoutes.js
        └── teacherRoutes.js
    └── 📁styles
        └── chess-viewer-overrides.css
    └── 📁utils
        └── api.js
        └── ChessEngine.js
        └── ChessEngineFactory.js
        └── KCAEngine.js
        └── OnlineChessEngine.js
        └── permissions.js
        └── PgnViewerFallback.js
        └── StockfishOnlineAPI.js
        └── test.html
    └── App.css
    └── App.js
    └── App.test.js
    └── index.css
    └── index.js
    └── logo.svg
    └── reportWebVitals.js
    └── setupTests.js
```

## Components

### Batches

#### `BatchList.js`
- **Purpose**: Renders a grid of batch cards with batch details.
- **Features**: 
  - Displays batch information including name, status, description, level, schedule and student count
  - Provides buttons to view details or manage students
  - Handles navigation to batch detail page
  - Uses color-coded status badges

#### `CreateBatchForm.js`
- **Purpose**: Form component for creating or editing batches.
- **Features**: 
  - Input fields for batch details
  - Form validation
  - Submission handling with API integration

#### `StudentSearch.js`
- **Purpose**: Search component for finding and selecting students to add to a batch.
- **Features**: 
  - Debounced search functionality with API integration
  - Student list display with selection capability
  - Handles capacity checks for batches
  - Provides student selection functionality to parent components

### Chess

#### `ChallengeList.js`
- **Purpose**: Displays a list of incoming and outgoing chess game challenges.
- **Features**: 
  - Separates challenges by direction (incoming/outgoing)
  - Provides accept/decline functionality for incoming challenges
  - Provides cancel functionality for outgoing challenges
  - Formats time control and timestamps

#### `ChessBoard.js`
- **Purpose**: Interactive chess board component with multiple play and analysis modes.
- **Features**: 
  - Interactive chess board with move validation
  - Support for AI opponent with configurable skill level
  - Position analysis with optional Stockfish integration
  - Move history and navigation
  - FEN position import/export
  - Support for online and local engine analysis

#### `ChessNavigation.js`
- **Purpose**: Navigation component for chess-related features.
- **Features**: 
  - Links to various chess sections (games, challenges, analysis, etc.)
  - Active state indication

#### `EngineAnalysis.js`
- **Purpose**: Displays chess engine analysis of the current position.
- **Features**: 
  - Shows engine evaluation score
  - Visual representation of position strength (white/black advantage)
  - Display of best move and analysis depth
  - Handles different evaluation types (numerical and mate)

#### `MoveHistory.js`
- **Purpose**: Displays and navigates through the move history of a chess game.
- **Features**: 
  - Shows moves in standard chess notation
  - Click navigation to any position in the game
  - Highlights current move

#### `PlayerList.js`
- **Purpose**: Displays a list of online players available for chess challenges.
- **Features**: 
  - Shows online status of players
  - Challenge functionality with configurable game options
  - UI for selecting color preference and time control
  - Prevents self-challenges

#### `SimulBoard.js`
- **Purpose**: Chess board component for simultaneous exhibitions where one player plays against multiple opponents.
- **Features**: 
  - Compact chess board display
  - Move validation
  - Game status indication
  - Visual highlighting of active board
  - Result display

### Classroom

#### `AttendanceModal.js`
- **Purpose**: Modal component for tracking student attendance.
- **Features**: 
  - Student list with attendance status options (present, absent, late)
  - Batch filtering
  - Attendance submission functionality

#### `ClassroomCalendar.js`
- **Purpose**: Calendar component for displaying and managing classroom sessions.
- **Features**: 
  - Integration with FullCalendar
  - Displays sessions and events
  - Handles date clicks for scheduling
  - Event click handlers for session details
  - Refreshable on data changes

#### `MaterialsView.js`
- **Purpose**: Component for displaying and managing classroom materials.
- **Features**: 
  - Lists teaching materials by type
  - Download functionality
  - Material upload interface for teachers
  - Filtering and organization options

### Common

#### `Modal.js`
- **Purpose**: Reusable modal dialog component.
- **Features**: 
  - Customizable title and content
  - Close functionality
  - Backdrop click handling
  - Focus management

### PGN Database

#### `PGNCard.js`
- **Purpose**: Card component for displaying PGN file information.
- **Features**: 
  - Shows PGN metadata (title, event, players)
  - Preview thumbnail of position
  - Action buttons (view, edit, share, delete)

#### `PGNList.js`
- **Purpose**: Displays a filterable list of PGN files.
- **Features**: 
  - Grid layout of PGN cards
  - Search and filter functionality
  - Pagination
  - Sort options

#### `ShareModal.js`
- **Purpose**: Modal dialog for sharing PGN files with other users.
- **Features**: 
  - User search and selection
  - Current share status display
  - Permission assignment

#### `UploadModal.js`
- **Purpose**: Modal for uploading and configuring PGN files.
- **Features**: 
  - File upload
  - Metadata editing
  - Visibility settings
  - PGN validation

### User Management

#### `Filters.js`
- **Purpose**: Filter controls for user management interfaces.
- **Features**: 
  - Role filtering
  - Status filtering
  - Search functionality
  - Filter reset

#### `UserTable.js`
- **Purpose**: Tabular display of user data with management functionality.
- **Features**: 
  - Sortable columns
  - Pagination
  - Action buttons for each user
  - Batch actions

#### `UserTableRow.js`
- **Purpose**: Individual row component for the user table.
- **Features**: 
  - User data display
  - Status indicators
  - Action buttons
  - Selection capability

#### `Modals/EditUserModal.js`
- **Purpose**: Modal for editing user details and permissions.
- **Features**: 
  - User information form
  - Role and permission management
  - Status toggling
  - Validation

### Other Components

#### `Breadcrumbs.js`
- **Purpose**: Navigation breadcrumbs component.
- **Features**: 
  - Dynamic breadcrumb generation based on current route
  - Navigation links to parent routes
  - Current page indication

#### `ErrorBoundary.js`
- **Purpose**: React error boundary component to catch and handle UI errors.
- **Features**: 
  - Error catching
  - Fallback UI
  - Error logging
  - Recovery options

#### `ExportButton.js`
- **Purpose**: Button component for exporting data in various formats.
- **Features**: 
  - Export to PDF, CSV, Excel
  - Format selection dropdown
  - Handles export logic

#### `LichessPgnViewer/fallback.js`
- **Purpose**: Fallback component for PGN viewer when the main component fails.
- **Features**: 
  - Basic PGN display
  - Error state handling
  - Simple navigation

#### `LichessPgnViewer/index.js`
- **Purpose**: Wrapper for the Lichess PGN Viewer component.
- **Features**: 
  - PGN parsing and rendering
  - Interactive board
  - Move navigation
  - Analysis integration

#### `NotificationBell.js`
- **Purpose**: Notification indicator and dropdown.
- **Features**: 
  - Unread count badge
  - Dropdown with notification list
  - Mark as read functionality
  - Notification preferences link

#### `ResourcePreview.js`
- **Purpose**: Preview component for educational resources.
- **Features**: 
  - Document previews
  - Video player
  - PDF viewer
  - Image gallery

#### `Sidebar.js`
- **Purpose**: Main application sidebar navigation.
- **Features**: 
  - Role-based menu items
  - Collapsible sections
  - Active route highlighting
  - Mobile responsive design

#### `student/QuizCard.js`
- **Purpose**: Card component displaying quiz information for students.
- **Features**: 
  - Quiz metadata display
  - Difficulty indicator
  - Progress tracking
  - Start/continue quiz button

#### `TopNavbar.js`
- **Purpose**: Top navigation bar for the application.
- **Features**: 
  - User profile dropdown
  - Notification bell
  - Sidebar toggle
  - Search functionality
  - Quick actions

## Hooks

#### `useAuth.js`
- **Purpose**: Custom hook for authentication and authorization.
- **Features**: 
  - User authentication state management
  - Login/logout functionality
  - Role-based access control
  - Token management and refresh
  - User profile data

## Pages

### Admin

#### `AdminDashboard.js`
- **Purpose**: Main dashboard page for administrators.
- **Features**: 
  - Overview statistics
  - Quick access cards to key admin areas
  - Activity summary
  - System health indicators

#### `AttendanceSettings.js`
- **Purpose**: Page for configuring attendance tracking settings.
- **Features**: 
  - Late threshold configuration
  - Absence policies
  - Notification settings
  - Default values

#### `AttendanceSystem.js`
- **Purpose**: Comprehensive attendance management page.
- **Features**: 
  - Calendar view of attendance
  - Export tools for attendance reports
  - Batch filtering
  - Date range selection
  - Settings modal

#### `BatchManagement.js`
- **Purpose**: Administrative interface for batch management.
- **Features**: 
  - Create/edit/delete batches
  - Assign teachers
  - Configure capacity and schedule
  - Student assignment

#### `NotificationManagement.js`
- **Purpose**: Interface for managing platform-wide notifications.
- **Features**: 
  - Create announcements
  - Send targeted notifications
  - Template management
  - Notification history

#### `PlatformAnalytics.js`
- **Purpose**: Analytics dashboard for platform usage and performance.
- **Features**: 
  - User engagement metrics
  - Content popularity
  - Time-series data visualization
  - Export functionality

#### `StudentAttendanceHistory.js`
- **Purpose**: Detailed attendance history for individual students.
- **Features**: 
  - Student selection
  - Calendar view
  - Attendance percentage
  - Absence patterns

#### `StudentAttendanceList.js`
- **Purpose**: List view of student attendance records.
- **Features**: 
  - Batch filtering
  - Date range selection
  - Attendance status indicators
  - Sortable columns

#### `SupportSystem.js`
- **Purpose**: Support ticket management system.
- **Features**: 
  - Ticket listing
  - Status updates
  - Response interface
  - Category filtering

#### `TournamentManagement.js`
- **Purpose**: Interface for creating and managing chess tournaments.
- **Features**: 
  - Tournament creation
  - Participant management
  - Schedule configuration
  - Results tracking

#### `TournamentRegistrations.js`
- **Purpose**: Manages tournament registrations and participants.
- **Features**: 
  - Registration approval
  - Payment verification
  - Participant listing
  - Communication tools

#### `UserActivity.js`
- **Purpose**: User activity monitoring interface.
- **Features**: 
  - Activity timeline
  - Action filtering
  - User filtering
  - Export functionality

#### `UserActivityPage.js`
- **Purpose**: Detailed view of a specific user's activity.
- **Features**: 
  - Chronological activity list
  - Session information
  - IP tracking
  - Action details

#### `UserAttendanceReport.js`
- **Purpose**: Comprehensive attendance reporting page.
- **Features**: 
  - Batch/class filtering
  - Date range selection
  - Statistical breakdown
  - Export to PDF/CSV

#### `UserManagement.js`
- **Purpose**: Main user administration page.
- **Features**: 
  - User listing with filtering
  - Role management
  - User creation, editing, deactivation
  - Bulk actions

### Auth

#### `Login.js`
- **Purpose**: User login page.
- **Features**: 
  - Authentication form
  - Remember me functionality
  - Forgot password link
  - Error handling
  - Redirect logic

#### `Register.js`
- **Purpose**: New user registration page.
- **Features**: 
  - Registration form with validation
  - Terms acceptance
  - Email verification
  - Role selection (if applicable)

#### `ResetPassword.js`
- **Purpose**: Password reset functionality.
- **Features**: 
  - Email submission
  - Token validation
  - New password form
  - Confirmation step

### Chess

#### `ChessHome.js`
- **Purpose**: Main landing page for chess section.
- **Features**: 
  - Quick access to chess features
  - Recent games
  - Challenges
  - Stats overview

#### `ChessStudies.js`
- **Purpose**: Chess study management and viewing.
- **Features**: 
  - Study creation and editing
  - Position analysis
  - Study sharing
  - Study browser

#### `GameArea.js`
- **Purpose**: Main interface for viewing and managing chess games.
- **Features**: 
  - Game listing
  - Game status filtering
  - Game creation
  - Practice positions

#### `InteractiveBoard.js`
- **Purpose**: Standalone interactive chess board page.
- **Features**: 
  - Position input
  - Move making
  - Position sharing
  - Engine analysis

#### `PlayerVsPlayer.js`
- **Purpose**: Interface for playing against other users.
- **Features**: 
  - Online player list
  - Challenge system
  - Game setup options
  - Player stats

#### `SimulGames.js`
- **Purpose**: Interface for simultaneous exhibitions.
- **Features**: 
  - Multiple board view
  - Simul creation
  - Board navigation
  - Game status tracking

### Student

#### `ClassroomDetails.js`
- **Purpose**: Detailed view of a classroom for students.
- **Features**: 
  - Class information
  - Materials access
  - Assignment submission
  - Discussion participation

#### `ClassroomPage.js`
- **Purpose**: Overview of all classes available to a student.
- **Features**: 
  - Enrolled classes
  - Available classes
  - Class enrollment functionality
  - Schedule view

#### `LeaderboardPage.js`
- **Purpose**: Displays rankings and achievements.
- **Features**: 
  - Overall leaderboard
  - Quiz-specific leaderboards
  - Ranking information
  - Achievement badges

#### `QuizDetailPage.js`
- **Purpose**: Interface for taking a specific quiz.
- **Features**: 
  - Question presentation
  - Answer submission
  - Timer
  - Progress tracking

#### `QuizHistoryPage.js`
- **Purpose**: History of student's quiz attempts.
- **Features**: 
  - List of attempted quizzes
  - Scores
  - Completion dates
  - Retry options

#### `QuizPage.js`
- **Purpose**: Main page listing available quizzes.
- **Features**: 
  - Quiz filtering by difficulty
  - Search functionality
  - Quiz cards with metadata
  - Completion status

#### `QuizResultsPage.js`
- **Purpose**: Displays results of a completed quiz.
- **Features**: 
  - Score breakdown
  - Correct/incorrect answers
  - Explanations
  - Retry option

#### `ResourceCenter.js`
- **Purpose**: Repository of educational resources for students.
- **Features**: 
  - Resource categorization
  - Search functionality
  - Bookmarking
  - Download options

#### `ResourceDetails.js`
- **Purpose**: Detailed view of a specific educational resource.
- **Features**: 
  - Resource preview
  - Download option
  - Related resources
  - Feedback mechanism

#### `StudentDashboard.js`
- **Purpose**: Main dashboard for students.
- **Features**: 
  - Overview of classes
  - Upcoming assignments
  - Recent quiz scores
  - Activity summary

#### `TournamentsPage.js`
- **Purpose**: Page for viewing and registering for tournaments.
- **Features**: 
  - Tournament listing
  - Registration functionality
  - Tournament details
  - Payment handling for entry fees

### Teacher

#### `BatchDetail.js`
- **Purpose**: Detailed view of a specific batch for teachers.
- **Features**: 
  - Student list
  - Attendance tracking
  - Performance metrics
  - Batch editing

#### `BatchManagement.js`
- **Purpose**: Teacher interface for managing batches.
- **Features**: 
  - Batch listing
  - Student assignment
  - Batch creation/editing
  - Schedule management

#### `ClassroomDetail.js`
- **Purpose**: Detailed management of a specific classroom.
- **Features**: 
  - Session management
  - Material uploads
  - Discussion board
  - Attendance tracking

#### `ClassroomManagement.js`
- **Purpose**: Teacher interface for managing all classrooms.
- **Features**: 
  - Classroom listing
  - Calendar view
  - Material management
  - Student tracking

#### `GradingFeedback.js`
- **Purpose**: Interface for providing feedback and grades to students.
- **Features**: 
  - Student selection
  - Feedback forms
  - Performance rating
  - History of feedback

#### `PGNDatabase.js`
- **Purpose**: Management of chess game records in PGN format.
- **Features**: 
  - PGN upload
  - Game tagging
  - Sharing functionality
  - Search and filtering

#### `QuizCreator.js`
- **Purpose**: Interface for creating and editing quizzes.
- **Features**: 
  - Question authoring
  - Multiple question types
  - Answer configuration
  - Quiz settings

#### `QuizManagement.js`
- **Purpose**: Teacher interface for managing quizzes.
- **Features**: 
  - Quiz listing
  - Creation/editing controls
  - Results viewing
  - Quiz deployment

#### `ReportsAnalytics.js`
- **Purpose**: Analytics and reporting for teacher's classes.
- **Features**: 
  - Performance metrics
  - Attendance statistics
  - Progress tracking
  - Exportable reports

#### `TeacherDashboard.js`
- **Purpose**: Main dashboard for teachers.
- **Features**: 
  - Class overview
  - Student metrics
  - Recent activity
  - Quick access to key features

### Notifications

#### `NotificationPreferences.js`
- **Purpose**: User interface for configuring notification preferences.
- **Features**: 
  - Email notification settings
  - In-app notification settings
  - Category preferences
  - Frequency settings

### Other Pages

#### `PGNViewer.js`
- **Purpose**: Standalone PGN viewer page.
- **Features**: 
  - Chess game replay
  - Move navigation
  - Analysis tools
  - Game metadata display

#### `Profile.js`
- **Purpose**: User profile management page.
- **Features**: 
  - Personal information
  - Password change
  - Profile picture
  - Preferences

## Routes

#### `adminRoutes.js`
- **Purpose**: Configuration file defining admin routes.
- **Features**: 
  - Path definitions
  - Component mapping
  - Title configuration
  - Permission requirements

#### `chessRoutes.js`
- **Purpose**: Configuration file defining chess-related routes.
- **Features**: 
  - Path definitions for chess pages
  - Component mapping
  - Title configuration
  - Accessibility settings

#### `studentRoutes.js`
- **Purpose**: Configuration file defining student routes.
- **Features**: 
  - Path definitions for student pages
  - Component mapping
  - Title configuration
  - Permission requirements

#### `teacherRoutes.js`
- **Purpose**: Configuration file defining teacher routes.
- **Features**: 
  - Path definitions for teacher pages
  - Component mapping
  - Title configuration
  - Permission requirements

## Utils

#### `api.js`
- **Purpose**: API service utility for making backend requests.
- **Features**: 
  - HTTP request methods (GET, POST, PUT, DELETE)
  - Authentication header handling
  - Response parsing
  - Error handling
  - Endpoint methods for various features

#### `ChessEngine.js`
- **Purpose**: Base chess engine integration class.
- **Features**: 
  - Abstract methods for chess analysis
  - Common engine functionality
  - Error handling
  - Resource management

#### `ChessEngineFactory.js`
- **Purpose**: Factory for creating appropriate chess engine instances.
- **Features**: 
  - Engine selection logic
  - Configuration handling
  - Feature detection
  - Fallback mechanisms

#### `KCAEngine.js`
- **Purpose**: Custom lightweight chess engine implementation.
- **Features**: 
  - Basic position evaluation
  - Move generation
  - Simple AI opponent
  - Minimal resource usage

#### `OnlineChessEngine.js`
- **Purpose**: Chess engine that uses online APIs for analysis.
- **Features**: 
  - Remote API integration
  - Result caching
  - Fallback handling
  - Configuration options

#### `permissions.js`
- **Purpose**: Utility for handling user permissions.
- **Features**: 
  - Permission checking
  - Role-based access control
  - Feature availability determination
  - UI adaptation helpers

#### `PgnViewerFallback.js`
- **Purpose**: Fallback implementation for PGN viewing.
- **Features**: 
  - Simple PGN parsing
  - Basic display functionality
  - Error resilience
  - Minimal dependencies

#### `StockfishOnlineAPI.js`
- **Purpose**: Integration with online Stockfish chess engine APIs.
- **Features**: 
  - API request handling
  - Response parsing
  - Error management
  - Configuration options

## App Files

#### `App.js`
- **Purpose**: Main application component.
- **Features**: 
  - Routing setup
  - Authentication wrapper
  - Layout management
  - Global state providers

#### `index.js`
- **Purpose**: Application entry point.
- **Features**: 
  - React initialization
  - Root component rendering
  - Global providers
  - Service worker registration