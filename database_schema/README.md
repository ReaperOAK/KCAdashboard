# Database Schema Documentation

This directory contains the complete database schema for the KCA Dashboard application, split into logical sections for better maintainability and navigation.

## File Structure

### Core Schema Files
- [`01_users_auth.md`](./01_users_auth.md) - Users, authentication, and profile management
- [`02_classrooms_batches.md`](./02_classrooms_batches.md) - Classroom management, batches, sessions, and assignments
- [`03_quizzes_assessment.md`](./03_quizzes_assessment.md) - Quizzes, questions, attempts, and feedback system
- [`04_chess_platform.md`](./04_chess_platform.md) - Chess games, studies, challenges, and player statistics
- [`05_pgn_content.md`](./05_pgn_content.md) - PGN file management, sharing, and annotations
- [`06_resources_materials.md`](./06_resources_materials.md) - Resource management and access control
- [`07_system_admin.md`](./07_system_admin.md) - System administration, notifications, support, and activity tracking

### Reference Files
- [`foreign_keys.md`](./foreign_keys.md) - Complete foreign key relationships reference
- [`indexes.md`](./indexes.md) - Database indexes and performance optimization

## Overview

The KCA Dashboard uses a MySQL database with the following main functional areas:

1. **Enhanced User Management** - User accounts, authentication, roles, and comprehensive profiles
   - FIDE integration for chess player identification and ratings
   - Document management system (profile pictures, certificates)
   - Role-specific profile fields (teaching experience, emergency contacts)
   - Rating history tracking and chess achievements

2. **Educational Structure** - Classrooms, batches, sessions, and student enrollment
3. **Assessment System** - Quizzes, questions (including chess positions), and grading
4. **Chess Platform** - Interactive chess features, games, studies, and challenges
5. **Content Management** - PGN files, resources, and educational materials
6. **System Administration** - Notifications, support tickets, permissions, and logging

## Key Features

### Chess Integration
- Chess position questions in quizzes (FEN notation support)
- Interactive chess games between users
- Chess studies and practice positions
- PGN file upload and sharing system

### Access Control
- Role-based permissions (student, teacher, admin)
- Resource sharing with classrooms, batches, or individual students
- Public/private content visibility controls

### Educational Tools
- Classroom discussions and assignments
- Batch management with scheduled sessions
- Attendance tracking with online meeting integration
- Grading and feedback systems

### Performance Features
- Comprehensive indexing for optimal query performance
- Full-text search capabilities on PGN files
- Efficient foreign key relationships with proper cascade rules

## Usage Guidelines

When modifying the database schema:

1. Update the relevant section file(s)
2. Update `foreign_keys.md` if adding/removing relationships
3. Update `indexes.md` if adding/removing indexes
4. Test all related functionality before deploying changes
5. Update this README if adding new functional areas

## Migration Notes

When creating database migrations:
- Follow the file order (01-07) for table creation dependencies
- Apply foreign keys after all tables are created
- Create indexes last for optimal performance during data import
