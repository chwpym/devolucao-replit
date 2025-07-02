# Sistema de Controle de Retorno de Peças

## Overview

This is a Parts Return Control System (Sistema de Controle de Retorno de Peças) designed as a web application for managing automotive parts returns. The system allows tracking of parts returned by customers, managing customer and mechanic information, and generating comprehensive reports.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Pure HTML, CSS (Bootstrap 5.3.2), and vanilla JavaScript
- **UI Framework**: Bootstrap 5 with custom CSS styling
- **Icons**: Font Awesome 6.4.0
- **Language**: Portuguese (pt-BR) localization
- **Client-Side Storage**: IndexedDB for local data persistence

### Backend Architecture
- **Database**: Dual approach - IndexedDB for client-side operations and Neon PostgreSQL for server-side operations
- **ORM**: Drizzle ORM with Neon serverless driver
- **Runtime**: Node.js with TypeScript support
- **Connection Pooling**: Neon serverless connection pooling

### Data Storage Solutions
- **Primary Storage**: IndexedDB (browser-based) for offline-first functionality
- **Server Storage**: PostgreSQL via Neon serverless platform
- **Schema Management**: Drizzle ORM with shared schema definitions
- **Database Version**: IndexedDB v2 with automatic migration support

## Key Components

### 1. Database Layer (`js/database.js`)
- IndexedDB initialization and management
- CRUD operations for devolutions and people
- Automatic indexing for fast searches
- Database versioning and migration support

### 2. Forms Management (`js/forms.js`)
- Form validation and submission handling
- Real-time field validation
- Error handling and user feedback
- Data sanitization and formatting

### 3. People Management (`js/pessoas.js`)
- Customer and mechanic registration
- Contact information management
- Person data validation
- Integration with devolution records

### 4. Reports System (`js/reports.js`)
- Comprehensive report generation
- Data aggregation and analysis
- Summary statistics calculation
- Trend analysis and time-based reports

### 5. Backup System (`js/backup.js`)
- Data export/import functionality
- JSON-based backup format
- Selective data backup options
- Database restoration capabilities

### 6. Utilities (`js/utils.js`)
- Date formatting (Brazilian locale)
- Currency formatting
- Data validation helpers
- Common utility functions

## Data Flow

### 1. Devolution Registration Flow
- User fills out devolution form (`cadastro.html`)
- Form validation occurs in real-time
- Data is sanitized and stored in IndexedDB
- Success/error feedback is provided to user

### 2. Query and Search Flow
- User accesses search interface (`consulta.html`)
- Filters are applied to IndexedDB indices
- Results are displayed in responsive tables
- Export options are available for filtered data

### 3. Report Generation Flow
- User selects report parameters (`relatorio.html`)
- Data is aggregated from IndexedDB
- Multiple report types are generated
- Reports can be exported or printed

### 4. Backup and Restore Flow
- User initiates backup process (`backup.html`)
- Data is exported to JSON format
- Import functionality allows data restoration
- Validation ensures data integrity

## External Dependencies

### CDN Resources
- **Bootstrap 5.3.2**: UI framework and responsive design
- **Font Awesome 6.4.0**: Icon library for enhanced UX
- **Custom CSS**: Application-specific styling (`css/styles.css`)

### Database Dependencies
- **Neon Database**: Serverless PostgreSQL platform
- **Drizzle ORM**: Type-safe database operations
- **WebSocket**: Real-time database connections
- **Connection Pooling**: Efficient database connection management

### Browser APIs
- **IndexedDB**: Client-side persistent storage
- **File API**: For backup export/import functionality
- **Local Storage**: Configuration and temporary data

## Deployment Strategy

### Development Environment
- **Platform**: Replit-based development
- **Database**: Neon serverless PostgreSQL
- **Environment Variables**: `DATABASE_URL` for database connection
- **Hot Reload**: Automatic reloading during development

### Production Considerations
- **Static Hosting**: Frontend can be deployed to any static host
- **Database**: Neon handles scaling and availability
- **Offline Support**: IndexedDB enables offline functionality
- **Performance**: Client-side processing reduces server load

### Data Migration Strategy
- **Dual Storage**: Gradual migration from IndexedDB to PostgreSQL
- **Backup Compatibility**: JSON format ensures data portability
- **Schema Evolution**: Drizzle migrations handle database changes

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 02, 2025 - Major System Enhancements

#### PWA Implementation
- ✅ Converted system to Progressive Web App (PWA)
- ✅ Added manifest.json with proper icons and metadata
- ✅ Implemented service worker (sw.js) for offline functionality
- ✅ Added install prompt and offline caching
- ✅ Configured for mobile app-like experience

#### Person Code System
- ✅ Added automatic person code generation (P0001, P0002, etc.)
- ✅ Updated database schema to include unique codigo field
- ✅ Modified person registration form to display auto-generated codes
- ✅ Enhanced dropdown displays to show "CODE - NAME" format

#### Alphabetical Ordering
- ✅ Implemented alphabetical sorting in client and mechanic dropdowns
- ✅ Applied Brazilian Portuguese locale sorting (localeCompare)
- ✅ Optimized dropdown loading with filtered and sorted results

#### Responsive Sidebar Menu
- ✅ Created left-side collapsible menu for mobile devices
- ✅ Added hamburger button that appears on screens < 992px
- ✅ Implemented smooth animations and overlay backdrop
- ✅ Added keyboard escape functionality

#### Smart People Consultation
- ✅ Modified people consultation to show only on explicit action
- ✅ Added "Consultar" button that toggles visibility
- ✅ Improved UX by hiding table until user requests it
- ✅ Maintained all sorting and filtering functionality

#### Database Architecture Updates
- ✅ Prepared PostgreSQL schema with Drizzle ORM
- ✅ Created dual storage approach (IndexedDB + PostgreSQL)
- ✅ Added unique constraints for person codes
- ✅ Implemented proper relations between tables

#### Additional Improvements
- ✅ Enhanced mobile responsiveness across all pages
- ✅ Improved form field spacing and visual design
- ✅ Added comprehensive PWA metadata and caching
- ✅ Optimized performance for offline usage

## Changelog

- July 02, 2025. Major PWA conversion and UX improvements