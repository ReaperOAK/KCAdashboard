# PGN Sharing Feature

## Overview
The PGN Sharing feature allows teachers and administrators to share chess studies (PGN files) with other users and entire batches/classrooms in the platform. This feature provides role-based access control, flexible permission management, and supports both individual and batch-level sharing.

## Features

### Role-Based Sharing
- **Teachers and Administrators**: Can share PGN studies with individual users and entire batches
- **Students**: Cannot share PGN studies (view-only access)

### Sharing Options
- **Individual Users**: Share with specific teachers or students
- **Batch Sharing**: Share with entire batches/classrooms, automatically including all students in those batches
- **Cross-Batch Sharing**: Teachers can share with students from other batches

### Permission Levels
- **View Only**: Recipients can view and analyze the PGN study but cannot modify it
- **View & Edit**: Recipients can view, analyze, and modify the PGN study

### User Interface
- Tabbed interface for individual users and batch selection
- Modal-based sharing interface with search and filtering
- Bulk selection with "Select All" functionality for both users and batches
- Real-time search across user names, emails, roles, and batch information
- Visual feedback for selected entities and permission levels
- Batch information display including student counts and teacher details

## Technical Implementation

### Frontend Components

#### PGNShareModal Component
- **Location**: `src/components/chess/modals/PGNShareModal.js`
- **Purpose**: Main sharing interface modal with dual-tab functionality
- **Features**:
  - Role-based access control
  - Tabbed interface (Individual Users / Batches)
  - User and batch search and filtering
  - Bulk selection for both users and batches
  - Permission level selection
  - Loading states and error handling
  - Batch metadata display (student counts, teacher info, difficulty levels)

#### PGNLibrary Integration
- **Location**: `src/components/chess/PGNLibrary.js`
- **Integration**: Share button on each PGN card
- **New Category**: "Shared with Me" for received shared studies

#### GameCard Enhancement
- **Location**: `src/components/chess/GameCard.js`
- **Features**: Share button for eligible users (teachers/admins)

### Backend Endpoints

#### Share PGN Study
- **Endpoint**: `POST /api/share-pgn.php`
- **Purpose**: Create new PGN shares with users and/or batches
- **Parameters**:
  - `pgn_id`: ID of the PGN to share
  - `user_ids`: Array of individual recipient user IDs (optional)
  - `batch_ids`: Array of batch IDs to share with (optional)
  - `permission`: Permission level ('view' or 'edit')
- **Logic**: Automatically expands batch selections to include all students in specified batches
- **Security**: Role validation, ownership verification, duplicate prevention

#### Get Shared PGNs
- **Endpoint**: `GET /api/get-shared-pgns.php`
- **Purpose**: Retrieve PGNs shared with the current user
- **Response**: List of shared PGN studies with metadata

#### Get Shareable Entities
- **Endpoint**: `GET /api/get-shareable-entities.php`
- **Purpose**: Get comprehensive list of users and batches available for sharing
- **Response**:
  - `teachers`: Array of teacher user objects with batch information
  - `students`: Array of student user objects with batch information
  - `batches`: Array of batch objects with teacher names, student counts, and metadata
- **Security**: Role-based filtering, excludes current user from individual lists

### Database Schema

#### pgn_shares Table
```sql
CREATE TABLE pgn_shares (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pgn_id INT NOT NULL,
    shared_by INT NOT NULL,
    shared_with INT NOT NULL,
    permission ENUM('view', 'edit') NOT NULL,
    shared_via_batch INT NULL,  -- References batch ID if shared through batch
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pgn_id) REFERENCES chess_pgns(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_via_batch) REFERENCES batches(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_share (pgn_id, shared_with)
);
```

#### Batch-Related Tables
- **batches**: Contains batch/classroom information
- **batch_students**: Links students to batches
- **classroom_students**: Alternative batch-student relationship table

## API Reference

### ChessApi Methods

#### sharePGN(pgnId, userIds, batchIds, permission)
- **Purpose**: Share a PGN study with users and/or batches
- **Parameters**:
  - `pgnId`: ID of the PGN study to share
  - `userIds`: Array of individual user IDs to share with (optional)
  - `batchIds`: Array of batch IDs to share with (optional)
  - `permission`: Permission level ('view' or 'edit')
- **Returns**: Promise with success/error response

#### getSharedPGNs()
- **Purpose**: Get all PGNs shared with the current user
- **Returns**: Promise with array of shared PGN studies

#### getShareableEntities()
- **Purpose**: Get comprehensive list of users and batches for sharing
- **Returns**: Promise with object containing teachers, students, and batches arrays

## Usage Examples

### Individual User Sharing
```javascript
// Share with specific users only
await ChessApi.sharePGN(pgnId, [userId1, userId2], [], 'view');
```

### Batch Sharing
```javascript
// Share with entire batches
await ChessApi.sharePGN(pgnId, [], [batchId1, batchId2], 'edit');
```

### Combined Sharing
```javascript
// Share with both individual users and batches
await ChessApi.sharePGN(pgnId, [userId1], [batchId1], 'view');
```

### Retrieving Shared Studies
```javascript
// Get all studies shared with current user
const sharedStudies = await ChessApi.getSharedPGNs();
```

### Getting Shareable Entities
```javascript
// Get lists of users and batches for sharing
const entities = await ChessApi.getShareableEntities();
console.log(entities.teachers, entities.students, entities.batches);
```

## Batch Sharing Logic

### Backend Processing
1. Teacher selects batches to share with
2. Backend expands batch selections to individual student users
3. Individual sharing records created for each student in selected batches
4. `shared_via_batch` field tracks the source batch for audit purposes
5. Duplicate sharing prevented by unique constraint

### Student Perspective
- Students receive shared PGNs regardless of source (individual or batch)
- No distinction in UI between individually shared vs. batch-shared content
- Access permissions apply consistently across all sharing methods

## Security Considerations

### Role-Based Access Control
- Only teachers and administrators can initiate sharing
- Students cannot share PGN studies but can receive shares
- Backend validates user roles before processing sharing requests
- Cross-batch sharing requires appropriate permissions

### Ownership Verification
- Users can only share PGN studies they own or have edit access to
- Shared studies maintain original ownership
- Permission escalation is prevented

### Batch Access Control
- Teachers can share with their own batches and other batches (cross-batch sharing)
- Batch membership validation ensures only active students receive shares
- Batch teacher information included for transparency

### Data Protection
- User and batch lists exclude sensitive information
- Sharing relationships are tracked for audit purposes
- Database constraints prevent duplicate shares
- Batch expansion logged for accountability

## User Experience

### For Teachers/Administrators
1. Open PGN Library or individual study
2. Click "Share" button on desired study
3. Choose between "Individual Users" and "Batches" tabs
4. Search and select users/batches to share with
5. Use "Select All" for bulk operations
6. Choose permission level (View/Edit)
7. Review selection count and confirm sharing

### For Students
1. Navigate to PGN Library
2. Select "Shared with Me" category
3. View and interact with received shared studies
4. Permission level determines available actions
5. No distinction between individually vs. batch-shared content

## Batch Information Display

### Batch Cards Show
- Batch name and difficulty level
- Teacher name and contact
- Current student count
- "Your batch" indicator for teacher's own batches
- Color-coded difficulty levels (beginner/intermediate/advanced)

### User Cards Show
- User name and email
- Role indicator (teacher/student)
- Associated batch information
- Type-specific styling

## Error Handling

### Frontend
- Role-based UI hiding for students
- Loading states during API calls
- User feedback via toast notifications
- Form validation for required selections
- Tab-specific empty states

### Backend
- Role validation with appropriate error messages
- Batch existence and membership validation
- Duplicate share prevention across all sharing methods
- Database transaction management for batch expansion
- Comprehensive error logging

## Performance Considerations

- Efficient user and batch search with database indexing
- Bulk sharing operations to minimize API calls
- Lazy loading of shareable entities
- Optimized queries for batch student expansion
- Single API call for comprehensive entity retrieval

## Future Enhancements

### Potential Features
- Classroom-based sharing groups
- Sharing expiration dates
- Share notification system
- Advanced permission management (per-batch permissions)
- Sharing analytics and usage tracking
- Batch sharing history and audit logs

### Technical Improvements
- Real-time collaboration features
- Offline sharing support
- Enhanced search capabilities with filters
- Bulk sharing management interface
- Automated batch synchronization for new students

## July 2025 Enhancement: Batch and Cross-Batch Sharing

- PGNs can now be shared with entire batches or students from other batches, not just individual users.
- The share modal allows teachers/admins to select one or more batches, or pick students from any batch.
- When sharing with a batch, all current students in that batch receive access.
- Backend validates batch membership and permissions for security.
- This makes it easy to distribute studies to whole classes or select groups across the academy.
