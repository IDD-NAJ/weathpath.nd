# Coming Soon Pages & Sections Inventory

## Overview
This document tracks all pages, sections, and features that are marked as "Coming Soon" or have placeholder states in the WealthPath application.

---

## 1. Content-Related Coming Soon States

### 1.1 Individual Article Pages
**Location:** `/app/articles/[slug]/page.tsx` (Line 126)
**Status:** Dynamic - Depends on article content
**Trigger:** When an article exists but has no content (NULL in database)
**Message:** "This article is coming soon. Stay tuned for the full content."
**Current State:** 
- Articles with no content show placeholder message
- Should have content populated before publication

### 1.2 Topic Articles Section
**Location:** `/app/topics/[slug]/page.tsx` (Lines 143, 154)
**Status:** Dynamic - Depends on published articles for that topic
**When Shown:** 
- If no published articles exist for a topic category
- Line 143: Shows "More articles coming soon" in subtitle
- Line 154: Shows "Articles coming soon" with icon and message

**Message:** "We're working on great {topic} content. Check back soon or browse all articles."
**Current State:**
- Topics with zero published/approved articles show this state
- Users are offered link to browse all articles as alternative

**Affected Topic Categories:**
- Any topic with no approved articles in its category
- Check categories in `/lib/topics.ts` for full list

---

## 2. Feature-Complete Pages (Fully Functional)

The following pages are **fully implemented** and NOT coming soon:

### Public Pages
- ✅ `/` - Landing page with hero, features, pricing, testimonials
- ✅ `/about` - About page
- ✅ `/login` - User login
- ✅ `/signup` - User registration
- ✅ `/forgot-password` - Password reset
- ✅ `/articles` - Article listing page
- ✅ `/courses` - Course catalog
- ✅ `/courses/[slug]` - Course details
- ✅ `/courses/[slug]/learn` - Course content lessons
- ✅ `/courses/[slug]/success` - Purchase success page
- ✅ `/stories` - Success stories listing
- ✅ `/stories/[id]` - Individual story detail
- ✅ `/topics/[slug]` - Topic exploration pages
- ✅ `/community` - Community hub (with forum, members, signup)
- ✅ `/privacy` - Privacy policy
- ✅ `/terms` - Terms of service

### Admin Pages
- ✅ `/admin` - Dashboard
- ✅ `/admin/analytics` - Analytics dashboard
- ✅ `/admin/approvals` - Content approvals workflow
- ✅ `/admin/articles` - Article management
- ✅ `/admin/courses` - Course management
- ✅ `/admin/users` - User management
- ✅ `/admin/learning-paths` - Learning path creation
- ✅ `/admin/stories` - Success story management
- ✅ `/admin/quizzes` - Quiz management
- ✅ `/admin/notifications` - Notification management
- ✅ `/admin/ai` - AI content generation
- ✅ `/admin/drafts` - Content draft management
  - `/admin/drafts/pending-review` - Drafts awaiting approval
  - `/admin/drafts/approved` - Approved drafts
  - `/admin/drafts/rejected` - Rejected drafts
  - `/admin/drafts/in-draft` - In-progress drafts
- ✅ `/admin/settings` - Admin settings

### User Pages
- ✅ `/dashboard` - User dashboard with progress, achievements, recommendations
- ✅ `/profile` - User profile and settings
- ✅ `/logout` - Logout handler

---

## 3. Dynamic Content Requirements

### Articles Content Status
**File:** `/app/articles/[slug]/page.tsx`

Articles show "coming soon" when:
1. Article record exists in database
2. Article is published (`is_published = true`)
3. Article status is approved (`status = 'approved'`)
4. BUT content field is NULL or empty

**To Fix:** Populate `articles.content` field before publishing

### Topic Articles Status
**File:** `/app/topics/[slug]/page.tsx`

Topics show "articles coming soon" when:
1. Query returns 0 articles for a topic's category
2. This happens when no articles have:
   - `is_published = true`
   - `status = 'approved'`
   - Category matching the topic

**To Fix:** Generate and publish articles for that category

---

## 4. Implementation Priorities

### High Priority (User-Facing)
- [ ] Populate article content for all published articles
- [ ] Generate approved articles for each topic category
- [ ] Ensure each topic has at least 3-5 published articles

### Medium Priority (Data Quality)
- [ ] Review all draft articles and approve/reject
- [ ] Update article metadata and categories
- [ ] Add images to articles

### Low Priority (Content Enhancement)
- [ ] Add related articles suggestions
- [ ] Add article recommendations
- [ ] Add reader engagement metrics

---

## 5. Database Queries to Check Status

### Check articles with no content:
```sql
SELECT id, title, slug, is_published, status, content
FROM articles
WHERE content IS NULL OR content = ''
AND is_published = true
AND status = 'approved';
```

### Check articles by topic:
```sql
SELECT category, COUNT(*) as article_count
FROM articles
WHERE is_published = true AND status = 'approved'
GROUP BY category
ORDER BY article_count ASC;
```

### Check draft status:
```sql
SELECT status, COUNT(*) as draft_count
FROM articles
GROUP BY status;
```

---

## 6. User Experience Notes

### Current Behavior
- Articles with no content show placeholder before CTA
- Topics with no articles show "coming soon" state with icon
- Both states encourage user action (quiz, browse all articles)
- No broken links or 404 errors

### Recommended UX Improvements
1. Add loading skeleton for initial article states
2. Show estimated publication date for "coming soon" articles
3. Add email notification signup for article updates
4. Suggest related content while waiting
5. Highlight newest/latest articles prominently

---

## 7. Content Generation Options

### Using AI Content Generator
The admin can now use the AI content generator to create:
- Research-backed articles (2000-3000 words)
- Detailed success stories
- Data-driven learning paths
- Case studies with metrics

**Location:** `/admin/ai`

### Types Available:
- Article (Standard or Research-Backed)
- Success Story
- Learning Path (Standard or Data-Driven)
- Case Study (Research-Based)
- Quiz

---

## 8. Monitoring & Maintenance

### Regular Checks
- [ ] Weekly: Check for articles with NULL content
- [ ] Weekly: Verify topic article coverage
- [ ] Monthly: Review article publication pipeline
- [ ] Monthly: Check content approval queue

### Automated Alerts (Recommended)
- Alert when topic has < 3 articles
- Alert when article created but not published within 7 days
- Alert when draft queue exceeds 10 items

---

## 9. Files to Update

When adding new content to remove "coming soon" states:

1. **Article Content**
   - File: Database `articles` table
   - Column: `content`
   - Ensure: `is_published = true`, `status = 'approved'`

2. **Topic Alignment**
   - File: `/lib/topics.ts`
   - Verify: Category names match article categories

3. **Metadata**
   - File: Articles metadata in database
   - Fields: `title`, `slug`, `excerpt`, `category`, `author_id`

---

## Summary Statistics

| Type | Count | Status |
|------|-------|--------|
| Public pages | 14 | ✅ Complete |
| Admin pages | 13 | ✅ Complete |
| User pages | 3 | ✅ Complete |
| Coming Soon States | 2 | ⏳ Content Dependent |
| Total Pages | 30 | 93% Complete |

**Coming Soon States:**
1. Empty article content (dynamic)
2. Articles missing for topic (dynamic)

Both are **content-driven**, not code-driven. System is complete and ready for content population.
