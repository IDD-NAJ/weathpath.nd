# CRITICAL: Schema Migration Required

## Status
⚠️ **The database schema must be updated before the application will work correctly.**

## Migration File
Run this migration: `scripts/008-fix-complete-schema.sql`

## How to Apply
```bash
# Option 1: Using the migration runner
node scripts/run-schema-fix.js

# Option 2: Manually via psql or database console
psql $DATABASE_URL < scripts/008-fix-complete-schema.sql

# Option 3: Via Neon console
# Copy contents of 008-fix-complete-schema.sql and paste into Neon SQL Editor
```

## What This Migration Does

### 1. Fixes Users Table
- Adds `profile_photo_url` field
- Adds `bio` field

### 2. Fixes Articles Table
Adds missing fields required by approval workflow:
- `summary`, `tags`, `difficulty`, `tone`, `length`, `audience`
- `key_points`, `estimated_read_time`
- `image_url`, `image_alt`, `image_caption`, `image_attribution`
- `published_at`

### 3. Fixes Success Stories Table
Adds missing fields:
- `slug`, `content`, `summary`, `author_id`
- `tags`, `difficulty`, `tone`, `length`, `audience`
- `key_points`, `estimated_read_time`
- `image_url`, `image_alt`, `image_caption`, `image_attribution`
- `published_at`

### 4. Fixes Learning Paths Table
Adds missing fields:
- `slug`, `content`, `summary`, `author_id`
- `tags`, `tone`, `length`, `audience`
- `key_points`, `estimated_read_time`
- `image_url`, `image_alt`, `image_caption`, `image_attribution`
- `published_at`
- Renames `level` to `difficulty` for consistency

### 5. Creates Quizzes Table
Full table creation with all required fields for content management.

### 6. Standardizes Status Values
- Changes `pending_approval` to `pending` across all tables
- Sets `published_at` for existing published content

### 7. Adds Performance Indexes
Creates indexes on all content tables for:
- `author_id`, `status`, `is_published`, `published_at`

## After Migration
Once the migration is applied, the following will work correctly:
- ✅ AI content approval workflow
- ✅ Admin dashboard metrics
- ✅ Public website content display
- ✅ Articles, Stories, Learning Paths, and Quizzes management
- ✅ Content publishing workflow
