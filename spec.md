# Community Organization Digital Platform
## Solution Architecture & Product Specification

**Version:** 1.0  
**Status:** Architecture baseline  
**Primary language:** English  
**Future language:** Hindi  
**Audience:** Public users, members, employees, Super Admin

---

# 1. Executive Architecture Decision

The platform will consist of four user-facing applications sharing one backend:

1. **Public Website**
2. **Android App**
3. **iOS App**
4. **Admin Portal**

All four will use the same central backend and database.

```text
                    ┌─────────────────────┐
                    │   Public Website    │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Mobile Apps       │
                    │ Android + iOS        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Backend API       │
                    │ Business Logic      │
                    │ Validation          │
                    │ Permissions         │
                    │ Import Processing   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
       │ PostgreSQL  │  │ Object      │  │ Google      │
       │ Database    │  │ Storage     │  │ Drive       │
       │             │  │ Optimized   │  │ Originals   │
       │ Main data   │  │ Images      │  │ + Backups   │
       └─────────────┘  └─────────────┘  └─────────────┘
```

The database is the **single source of truth** for application data.

Google Drive is the source for original photos and full backups.

Object storage contains optimized images used by the public applications.

---

# 2. Primary Design Goals

The system must be:

- Modern but community-oriented.
- Extremely easy for 35+ and 60+ users.
- Easy for non-technical employees to operate.
- Safe against bad Excel imports.
- Privacy-conscious.
- Low-cost to operate.
- Easy for the Super Admin to configure.
- Searchable.
- Mobile-friendly.
- Accessible.
- English-first but Hindi-ready.
- Maintainable for many years.
- Expandable without rebuilding the core system.

---

# 3. User Types

## 3.1 Public User

No account required.

Public users can:

- View homepage.
- Search content.
- Browse announcements.
- Browse events.
- Browse social work.
- Browse gallery.
- Browse public members.
- View current management.
- View About/History.
- View public achievements.
- Submit contact requests.
- Contact through WhatsApp.
- Receive push notifications through the mobile app.
- Use recently viewed cached app content offline.

No public login will be required.

---

## 3.2 Super Admin

The Super Admin has complete system control.

The Super Admin can:

- Manage employees.
- Create roles.
- Assign permissions.
- Override individual permissions.
- Manage members.
- Manage management records through member data.
- Manage events.
- Manage gallery.
- Manage social work.
- Manage announcements.
- Send notifications.
- Manage contact submissions.
- Manage website settings.
- Manage branding.
- Manage social links.
- Manage contact details.
- Manage categories.
- Manage homepage content.
- Manage statistics overrides.
- Verify/import Excel.
- Download rejected Excel.
- Review rejection history.
- Archive records.
- Restore records.
- Permanently delete records.
- Create full backups.
- Restore full backups.
- View audit logs.

---

## 3.3 Employee

Employees receive only the permissions assigned by the Super Admin.

Example:

```text
Employee A
Gallery:
  View
  Upload
  Edit

Employee B
Members:
  View
  Import
  Edit

Employee C
Announcements:
  Create
  Edit
  Schedule

Employee D
Contact:
  View
  Assign
  Resolve
```

Permissions are configurable at the **feature/action level**.

---

# 4. Role and Permission System

The system will support:

- Custom roles.
- Individual permissions.
- Permission overrides.
- Active employee accounts.
- Archived employee accounts.

Example permission hierarchy:

```text
Members
├── View
├── Create
├── Edit
├── Import
├── Archive
└── Delete

Events
├── View
├── Create
├── Edit
├── Import
├── Archive
└── Delete

Gallery
├── View
├── Upload
├── Edit
├── Archive
└── Delete
```

Permanent deletion remains restricted to the Super Admin regardless of other permissions.

---

# 5. Authentication

Admin and employee authentication will use:

**Email + password**

Requirements:

- Secure password hashing.
- Login rate limiting.
- Session expiration after inactivity.
- Secure session cookies/tokens.
- Password reset controlled by Super Admin.
- Archived employees cannot log in.
- Login/logout activity recorded in audit logs.

Public users do not authenticate.

---

# 6. Public Website

Main navigation:

```text
Home
About
Social Work
Events
Gallery
Members
Management
Announcements
Contact
Search
```

The navigation will remain intentionally simple.

The website will prioritize:

- Large readable typography.
- High contrast.
- Large buttons.
- Large touch targets.
- Simple menus.
- Minimal animation.
- Clear headings.
- Accessible forms.
- Keyboard accessibility.
- Screen-reader-friendly structure.
- Reduced-motion support.

---

# 7. Homepage

The homepage will use the selected **balanced model**.

Recommended structure:

```text
Header
│
├── Logo
├── Navigation
└── Global Search

Important Announcement Banner
│
Hero / Organization Introduction
│
Quick Access
│
Our Impact Statistics
│
Latest Announcements
│
Upcoming Events
│
Featured Social Work
│
Gallery Highlights
│
About / Mission Snapshot
│
Contact / WhatsApp
│
Footer
```

The homepage will be database-driven.

The Super Admin can:

- Feature content.
- Unfeature content.
- Change display order.
- Select featured events.
- Select featured announcements.
- Select featured social-work activities.
- Select gallery highlights.

---

# 8. Important Announcement Banner

Important/new announcements can appear as a small dismissible banner.

The design will avoid:

- Flashing content.
- Aggressive animations.
- Auto-scrolling text.
- Excessive popups.

Announcements remain available on the dedicated page.

---

# 9. About Us

One main About page with clearly separated sections:

- Organization overview.
- History.
- Founding information.
- Mission.
- Vision.
- Objectives.
- Achievements.
- Milestones.

Achievements and milestones are individual database records.

Each can contain:

- Year/date.
- Title.
- Description.
- Optional photo.
- Display status.
- Display order.

---

# 10. Our Impact Statistics

Statistics are primarily database-driven.

Examples:

- Total members.
- Total events.
- Total social-work activities.
- Years of service.
- Other approved organizational metrics.

Whenever new data is imported, relevant statistics refresh automatically.

The Super Admin can manually override/correct a statistic if the calculated value is incorrect.

Year-wise statistics are intentionally excluded from version 1.

---

# 11. Members

Members are maintained through the member database.

Public member directory supports:

- Search by name.
- Alphabetical browsing.
- Category filtering.
- Designation filtering.

Each member can have a dedicated profile page.

Only fields marked public are displayed.

Potential fields:

- Member ID.
- Member Code.
- Name.
- Photo.
- Designation.
- Category.
- Phone.
- Email.
- Address.
- Management status.
- Management post.
- Display order.
- Public/private flags.
- Active/archive status.

Sensitive fields default to private.

---

# 12. Current Management

Current Management is **not a separate member database**.

It is automatically generated from member records.

Excel fields:

```text
Current Management = Yes/No
Management Post
Display Order
```

A member with:

```text
Current Management = Yes
```

appears automatically on the Current Management page.

The page displays:

- Photo.
- Name.
- Designation/post.
- Display order.

The same person remains available in the normal Members directory.

This gives us one source of truth.

---

# 13. Social Work

Social Work receives a dedicated public section.

Social Work supports two types:

### Ongoing Initiative

Example:

```text
Education Support
```

### Individual Project

Example:

```text
Winter Blanket Distribution 2026
```

Each Social Work record can contain:

- Title.
- Category.
- Type.
- Description.
- Start date.
- End date.
- Location.
- Status.
- Photos.
- Related events.
- Public/private fields.
- Featured status.
- Display order.

---

# 14. Social Work Categories

Categories are fully configurable by Super Admin.

Examples:

- Education.
- Healthcare.
- Blood Donation.
- Food Distribution.
- Environment.
- Community Support.

The Super Admin can:

- Add category.
- Rename category.
- Archive category.
- Restore category.
- Change display order.

---

# 15. Social Work Relationship

The selected architecture is:

```text
Social Work Activity
        │
        ├── Event
        ├── Event
        ├── Event
        └── Event
```

One Social Work Activity can have multiple Events.

Each Event belongs to exactly **one Social Work category/activity**.

Public navigation:

```text
Social Work Category
      ↓
Activity
      ↓
Related Events
      ↓
Event Photos
```

This provides a natural history of the organization's work.

---

# 16. Events

Events are separate database entities.

Each event supports:

- Event ID.
- Event Code.
- Title.
- Description.
- Social Work Activity.
- Social Work Category.
- Date.
- Start time.
- End time.
- Location.
- Address.
- Google Maps link.
- Status.
- Featured flag.
- Countdown flag.
- Photos.
- Album.
- Archive state.

Event statuses:

```text
Upcoming
Ongoing
Completed
```

No public event registration will be included in version 1.

---

# 17. Event Gallery

One event has one album.

```text
Event
  └── Album
       ├── Photo
       ├── Photo
       ├── Photo
       └── Photo
```

The album supports multiple photos.

Public users can browse:

```text
Year
  ↓
Event
  ↓
Album
  ↓
Photos
```

They can also use:

- Search.
- Year filters.
- Event filters.
- Category filters.

---

# 18. Photo Viewer

Gallery photos open in a responsive full-screen viewer.

Features:

- Previous/next.
- Caption display.
- Close.
- Mobile swipe support.
- Keyboard navigation.
- Responsive sizing.
- Optimized loading.

Thumbnails remain clean.

Captions appear primarily inside the full-screen viewer.

---

# 19. Image Processing

The original photo remains in Google Drive.

Before public storage:

```text
Google Drive
    ↓
Validate
    ↓
Download
    ↓
Check file type
    ↓
Check dimensions
    ↓
Resize
    ↓
Compress
    ↓
Generate thumbnail
    ↓
Store optimized versions
```

Recommended image profiles:

### Member / Management photo

- Standard display: approximately 600 × 750 px.
- Thumbnail: approximately 240 × 300 px.
- Preserve portrait composition.

### Gallery/Event photo

- Standard display: maximum approximately 1600 × 1200 px.
- Thumbnail: maximum approximately 400 px on the longest side.
- Preserve original aspect ratio.

The system will not unnecessarily enlarge small images.

EXIF orientation will be normalized.

Unsupported or corrupted images fail validation.

---

# 20. Photo Storage

Architecture:

```text
Google Drive
Original photos
      │
      ▼
Backend processor
      │
      ▼
Optimized object storage
      │
      ▼
Website / Android / iOS
```

Google Drive remains the original/source repository.

Optimized images are served from low-cost object storage.

Cloudflare R2 is a suitable choice because its current standard storage is $0.015/GB-month, with a 10 GB/month free storage allowance and no Internet egress charge under its current pricing model.

For the expected photo volume, storage cost should remain very small initially.

---

# 21. Google Drive Integration

The organization will have a designated Google Drive area for:

```text
Organization Drive
│
├── Photos
│   ├── Members
│   ├── Management
│   ├── Events
│   └── Social Work
│
├── Excel
│
├── Backups
│
└── Rejected Imports
```

The Excel file references the photo using a predictable Drive path/reference and filename.

The system will locate the file within the organization's configured Drive root.

The backend will not expose Drive credentials to public users.

Standard Drive API usage currently has no additional API charge, subject to Google's quotas.

---

# 22. Excel Templates

Every importable module gets its own official template.

Examples:

```text
Members_Template.xlsx
Events_Template.xlsx
Social_Work_Template.xlsx
Announcements_Template.xlsx
Gallery_Template.xlsx
```

The Admin Portal will provide:

**Download Template**

The system will strictly validate the uploaded file against the expected template.

---

# 23. Excel Import Workflow

This is one of the most important parts of the system.

```text
Admin selects template
        ↓
Uploads Excel
        ↓
Structural validation
        ↓
Record validation
        ↓
Duplicate detection
        ↓
Photo reference validation
        ↓
Preview results
        ↓
95 Passed / 5 Failed
        ↓
Admin reviews
        ↓
Upload Accepted Records
        ↓
95 records imported
        ↓
5 rejected records exported
        ↓
5 records stored in rejection database
```

Nothing enters the main database before validation and explicit confirmation.

---

# 24. Structural Validation

The system immediately rejects the entire file if:

- Wrong file type.
- Missing required columns.
- Incorrect column names.
- Wrong template.
- Invalid worksheet structure.
- Unsupported data types.
- Invalid headers.
- Unexpected required-field changes.

The system will not attempt risky automatic column mapping.

---

# 25. Record Validation

Each row is checked for:

- Required values.
- Valid dates.
- Valid numbers.
- Valid enumerations.
- Valid references.
- Valid IDs.
- Duplicate records.
- Invalid categories.
- Invalid management fields.
- Invalid privacy values.
- Invalid photo references.
- Invalid status values.

Errors are associated with the exact Excel row.

---

# 26. Duplicate Detection

Two levels:

### Hard duplicate

Automatically fails.

Examples:

- Existing Member Code.
- Existing Event Code.
- Existing permanent reference ID.

### Possible duplicate

Generates warning.

Examples:

- Similar member name + same phone.
- Similar member name + same email.
- Similar event name + same date.

The admin can review warnings before importing.

---

# 27. Accepted and Rejected Records

Suppose:

```text
100 records
95 passed
5 failed
```

Admin sees:

```text
Passed: 95
Failed: 5
Warnings: X
```

The admin clicks:

**Upload Accepted Records**

Only the 95 accepted records are imported.

The 5 failed records are not imported.

---

# 28. Rejected Excel

The system generates a downloadable rejected Excel containing:

- Original row number.
- Original record data.
- Error type.
- Error message.
- Suggested correction where possible.
- Validation timestamp.
- Import batch ID.

The admin fixes the file and uploads it again.

---

# 29. Rejection Database

Rejected records are also stored separately.

Recommended data:

```text
Rejection ID
Import Batch ID
Module
Original Row Number
Record Reference
Original Data
Validation Errors
Warnings
Rejected By
Rejected At
Resolution Status
Resolved At
Resolved By
```

Possible status:

```text
Rejected
Corrected
Re-uploaded
Resolved
```

This provides permanent traceability.

---

# 30. Photo Validation During Import

Photo handling follows the selected workflow:

### Verify stage

The system checks:

- Photo reference exists.
- File exists in Drive.
- File is accessible.
- File type is supported.
- File is not corrupted.
- Basic dimensions are acceptable.

The system does **not** process/store the photo yet.

### Final Upload stage

For accepted records only:

```text
Drive photo
    ↓
Download
    ↓
Resize
    ↓
Compress
    ↓
Generate optimized versions
    ↓
Store in object storage
    ↓
Save image references
```

This avoids wasting processing on rejected records.

---

# 31. Business IDs

Every important entity has two identifiers.

### Internal ID

Database-generated permanent identifier.

### Business Reference

Human-friendly identifier used in Excel.

Examples:

```text
MEM-000123
EVT-2026-0012
SW-000045
ANN-2026-008
```

This provides reliable imports while keeping Excel understandable.

---

# 32. Announcements

Announcement lifecycle:

```text
Draft
   ↓
Scheduled
   ↓
Published
   ↓
Archived
```

Features:

- Title.
- Content.
- Publish date.
- Schedule date/time.
- Expiry date if needed.
- Featured flag.
- Important flag.
- Status.
- Notification option.
- Archive.

Important announcements can appear in the homepage banner.

---

# 33. Push Notifications

Push notifications are mandatory.

The system supports:

### Custom notification

Admin enters:

- Title.
- Message.
- Destination.

### Content-based notification

Admin selects:

- Announcement.
- Event.
- Social Work activity.

The system prepares the notification.

Admin reviews and sends.

Notifications are sent to **all app users**.

The notification opens the relevant content directly.

Firebase Cloud Messaging currently lists Cloud Messaging as no-cost, making it a good fit for the budget target.

---

# 34. Notification Audit

Every notification stores:

- Sender.
- Date/time.
- Title.
- Message.
- Content reference.
- Number of targeted devices.
- Send status.
- Delivery-related information where available.

This creates a notification history.

---

# 35. Contact Form

Public contact form fields will be configurable.

Basic fields:

- Name.
- Email.
- Phone.
- Subject.
- Message.

The form will include:

- Validation.
- Spam protection.
- Rate limiting.
- Confirmation message.

Contact workflow:

```text
New
 ↓
Assigned
 ↓
In Progress
 ↓
Resolved
 ↓
Closed
```

Admins can assign a message to another employee.

---

# 36. Contact Notifications

When a new contact request arrives:

1. Store in database.
2. Notify configured admin email.
3. Optionally send admin push notification.
4. Create audit entry.

---

# 37. WhatsApp

WhatsApp is a direct contact channel.

The Super Admin can configure the organization's WhatsApp number.

The public interface provides a clear:

**Contact us on WhatsApp**

button.

It opens WhatsApp on the user's device.

No separate WhatsApp messaging system will be built.

---

# 38. Contact Information

The Super Admin can individually configure visibility of:

- Address.
- Phone.
- Email.
- WhatsApp.
- Google Maps.
- Office hours.
- Social links.

Only enabled information appears publicly.

---

# 39. Social Media

Social media links are not hard-coded.

Super Admin can:

- Add platform.
- Name platform.
- Add URL.
- Change icon/display name.
- Reorder.
- Disable.
- Remove.

This supports future platforms without software changes.

---

# 40. Locations

Version 1 supports:

- One primary organization location.
- Event-specific locations.

The data model will support multiple organization locations later.

Google Maps will use normal links rather than unnecessary map API usage wherever possible, reducing cost.

---

# 41. Search

Search is mandatory.

Two search levels:

### Global Search

Search across:

- Members.
- Events.
- Social Work.
- Announcements.
- Gallery.
- About content where appropriate.

### Section Search

Examples:

```text
Members:
Name / category / designation

Events:
Keyword / year / category / status

Gallery:
Year / event / category

Social Work:
Category / activity / year

Announcements:
Keyword / date
```

Search respects privacy and publication status.

Private member information can never appear in public search.

---

# 42. No-Result Search

When no results exist:

```text
No results found.
Try another name, keyword, year, or category.
```

The system will not expose private records as “hidden results”.

---

# 43. Archive Model

Records can be:

```text
Active
Archived
Deleted
```

### Active

Available normally.

### Archived

Hidden from public view but retained.

### Deleted

Permanently removed.

Only Super Admin can permanently delete.

---

# 44. Delete Safeguard

Permanent deletion uses a simple confirmation dialog.

The action is still:

- Permission protected.
- Audit logged.
- Irreversible.

Archived records can be:

- Restored.
- Permanently deleted.

---

# 45. Audit Log

Important actions are logged.

Examples:

```text
Login
Logout
Employee created
Employee archived
Role created
Permission changed
Member imported
Event imported
Gallery uploaded
Record edited
Record archived
Record restored
Record deleted
Announcement published
Announcement scheduled
Notification sent
Contact assigned
Backup created
Backup restored
Settings changed
```

Audit record:

```text
Actor
Action
Entity
Entity ID
Timestamp
Previous value where appropriate
New value where appropriate
IP/device metadata where appropriate
```

Audit logs are read-only to ordinary employees.

---

# 46. Backup

The Super Admin manually initiates:

**Backup Everything**

The backup includes:

- Database.
- Configuration.
- Permissions.
- Roles.
- Audit logs.
- Rejection history.
- Application content metadata.
- Relevant stored files/references.
- Backup manifest.

The backup is stored in Google Drive.

There is deliberately **no scheduled backup**, according to the selected requirement.

---

# 47. Restore

Super Admin can initiate restore.

The system will:

1. Validate backup.
2. Check backup version.
3. Verify integrity.
4. Display backup metadata.
5. Require confirmation.
6. Perform restore.
7. Validate restored database.
8. Record restore in audit log.

Restore should be treated as a high-impact administrative operation.

---

# 48. Mobile Applications

One shared mobile codebase will power:

- Android.
- iOS.

The mobile app navigation:

```text
Home
Search
Events
Gallery
More
```

More contains:

- Social Work.
- Members.
- Management.
- Announcements.
- About.
- Contact.

This keeps the primary navigation simple for older users.

---

# 49. Mobile Offline Behavior

The app will provide basic offline caching.

Recently viewed content can remain available temporarily.

When the device reconnects:

```text
Cached content
     ↓
Check server
     ↓
Fetch updates
     ↓
Refresh local cache
```

We will not implement full offline synchronization in version 1.

---

# 50. App Updates

Older app versions remain usable where possible.

Users are encouraged to update.

A mandatory update can be activated only when required for:

- Security.
- Critical compatibility.
- Backend/API changes.

---

# 51. Design System

The organization logo will be the primary brand anchor.

After the logo is provided, the design system will derive:

- Primary color.
- Secondary color.
- Accent color.
- Background colors.
- Typography.
- Button styles.
- Card styles.
- Icon treatment.

Design direction:

**Modern + Community-oriented + Trustworthy + Warm + Accessible**

Avoid:

- Corporate-heavy styling.
- Excessive gradients.
- Tiny text.
- Dense dashboards.
- Excessive animation.

---

# 52. Recommended Typography

For the target audience:

- Highly readable sans-serif font.
- Strong weight hierarchy.
- Large body text.
- Comfortable line height.

The exact font will be finalized after seeing the logo/brand style.

---

# 53. Hindi Readiness

Version 1 launches in English.

The architecture will support:

```text
English
Hindi
```

later.

Translatable content fields will be designed so that future Hindi support does not require redesigning the database.

Future content can support:

```text
English title
Hindi title

English description
Hindi description
```

The same applies to:

- Announcements.
- About content.
- Social Work.
- Events.
- Categories.
- Milestones.

---

# 54. Recommended Technology Stack

I will make the following technical decisions.

### Public Website

**Next.js + TypeScript**

Reasons:

- Excellent performance.
- SEO.
- Responsive web.
- Accessible UI.
- Easy deployment.
- Shared components.

### Admin Portal

**Next.js + TypeScript**

The same ecosystem will reduce maintenance.

### Mobile

**Flutter + Dart**

One codebase produces:

- Android.
- iOS.

This is significantly more economical than maintaining two separate native applications.

### Backend

**Python + FastAPI**

Used for:

- Business logic.
- Excel processing.
- Google Drive integration.
- Image processing.
- Import validation.
- Permissions.
- Notifications.
- Backup/restore orchestration.

### Database

**PostgreSQL**

Primary system of record.

### Image/object storage

**Cloudflare R2**

Optimized images only.

### Original file storage

**Google Drive**

### Push notifications

**Firebase Cloud Messaging**

### Search

**PostgreSQL full-text/trigram search initially**

We will not introduce Elasticsearch/OpenSearch at this scale.

### Hosting

Managed cloud hosting.

No dedicated server administration will be required initially.

---

# 55. Why PostgreSQL Instead of Multiple Databases

There will be one primary application database.

This avoids:

- Data duplication.
- Synchronization problems.
- Complicated reporting.
- Inconsistent member records.

The rejection system is a separate logical area/database schema within the same PostgreSQL system rather than an unnecessary second database server.

---

# 56. Recommended Database Modules

Major logical database areas:

```text
Authentication
Employees
Roles
Permissions
Audit Logs

Members
Member Categories
Member Visibility

Management

Social Work
Social Work Categories
Social Work Events

Events
Event Albums
Photos

Announcements

Notifications

Contact Submissions

About
Achievements
Milestones

Homepage Features
Statistics
Organization Settings
Social Links
Locations

Import Batches
Import Rows
Rejected Records
Import Errors

Backup Records
System Configuration
```

---

# 57. Important Relationships

```text
Member
  └── Management flag

Social Work Category
  └── Social Work Activity
        └── Events
              └── Album
                    └── Photos

Employee
  └── Roles
        └── Permissions

Import Batch
  ├── Accepted Rows
  └── Rejected Rows

Announcement
  └── Notification

Event
  └── Notification

Contact Submission
  └── Employee Assignment
```

---

# 58. Data Visibility Model

Public/private visibility is stored with the data model.

Example:

```text
phone_public = false
email_public = false
address_public = false
photo_public = true
designation_public = true
```

The public API will enforce visibility.

The frontend will never receive private fields merely to hide them visually.

This is an important security rule.

---

# 59. API Security

The backend will enforce:

- Authentication.
- Authorization.
- Role permissions.
- Input validation.
- Rate limiting.
- File validation.
- Request size limits.
- Secure headers.
- CSRF protection where applicable.
- Secure cookies/tokens.
- Audit logging.
- Database constraints.

Admin APIs and public APIs will be separated logically.

---

# 60. Excel Security

Uploaded files are treated as untrusted input.

The system will:

- Limit file size.
- Allow only approved formats.
- Validate workbook structure.
- Sanitize spreadsheet content.
- Validate formulas/content.
- Prevent unsafe file execution.
- Never execute Excel macros.
- Scan referenced image files.
- Reject corrupted files.

---

# 61. Admin Dashboard

The Super Admin dashboard will focus on actions requiring attention.

It will show:

```text
Members
Events
Social Work
Gallery
Announcements

Pending Imports
Rejected Records
Unread Contacts
Scheduled Announcements
Recent Notifications
Recent Admin Activity
Backup Information
```

The dashboard will not become an unnecessary analytics-heavy system.

---

# 62. Admin Import Dashboard

A dedicated import area:

```text
Import Data

1. Download Template
2. Upload Excel
3. Verify
4. Review Results
5. Upload Accepted
6. Download Rejected
7. View Rejection History
```

This workflow will be consistent across all modules.

---

# 63. Admin-Friendly Error Messages

Avoid technical messages such as:

```text
ForeignKeyViolation
```

Instead:

```text
Row 48:
The category "Blood Donation" does not exist.

Fix:
Select an existing category or create the category before uploading.
```

The goal is that a normal employee can fix problems without contacting a developer.

---

# 64. Budget Strategy

The system intentionally avoids expensive infrastructure.

We will not initially use:

- Elasticsearch.
- Kubernetes.
- Dedicated database clusters.
- Multiple backend servers.
- Separate native Android/iOS codebases.
- Paid SMS authentication.
- Expensive image CDN plans.
- Dedicated map APIs.
- Scheduled backup infrastructure.

The application volume is small enough that these would add cost without meaningful benefit.

---

# 65. Current Infrastructure Cost Direction

A practical production setup can use:

- Managed PostgreSQL/backend services.
- Low-cost application compute.
- Cloudflare R2 for optimized images.
- Google Drive for originals and backups.
- Firebase Cloud Messaging for push.
- Existing email infrastructure or a low-cost transactional email provider.

For reference, Supabase's current Pro plan starts at $25/month and includes 8 GB database disk, 100 GB file storage, 250 GB egress, and other production features.

Cloudflare R2 currently includes 10 GB-month of standard storage, 1 million Class A operations, 10 million Class B operations, and free Internet egress each month.

Firebase Cloud Messaging is currently listed as no-cost.

These figures are current reference pricing, not a final hosting quote.

---

# 66. Recommended Starting Infrastructure

For the initial production system:

```text
Web:
Managed Next.js hosting

Backend:
Managed Python service

Database:
Managed PostgreSQL

Images:
Cloudflare R2

Originals:
Google Drive

Push:
Firebase Cloud Messaging

Email:
Transactional email provider

Domain:
Organization-owned domain
```

This keeps operations simple.

---

# 67. Estimated Ongoing Budget

A reasonable target is:

### Initial production infrastructure

Approximately **$25–60/month**, excluding:

- Domain registration.
- Apple Developer account.
- Google Play developer account.
- Any existing Google Drive subscription.
- Transactional email overages.
- Exceptional traffic.

The exact amount depends on the selected hosting providers and traffic.

With the organization's expected initial data volume, storage itself should not be a significant expense.

---

# 68. Development Cost Control

The largest cost is development, not storage.

To reduce development cost:

- One backend.
- One database.
- One web codebase.
- One admin codebase.
- One Flutter mobile codebase.
- Reusable UI components.
- Shared validation logic.
- Standard Excel templates.
- Configurable permissions instead of custom employee-specific code.

---

# 69. Initial Data Capacity

The current expected scale is modest.

The architecture is deliberately much larger than today's requirement so that the organization does not need an expensive rebuild later.

Expected initial examples:

```text
Members:
~250 initially

Events:
~15 initially

Photos:
~250 initially

Annual new photos:
~50/year
```

This workload is extremely small for PostgreSQL and object storage.

---

# 70. Performance Strategy

Public content will be optimized through:

- CDN/object storage images.
- Image thumbnails.
- Lazy loading.
- Server-side rendering where useful.
- Database indexes.
- Search indexes.
- Browser caching.
- Mobile caching.
- Minimal JavaScript on content pages.

The target is a fast experience even on slower mobile connections.

---

# 71. Accessibility Target

We will implement enhanced accessibility:

- Semantic HTML.
- Keyboard navigation.
- Screen-reader support.
- Accessible labels.
- Accessible forms.
- Good contrast.
- Large touch targets.
- Reduced-motion support.
- Focus indicators.
- Meaningful image descriptions where appropriate.

This is especially important for the organization's older audience.

---

# 72. SEO

The public website will be SEO-friendly.

Each public content type can have:

- Search-engine-friendly URL.
- Page title.
- Meta description.
- Structured metadata where useful.
- Social preview metadata where appropriate.
- Sitemap.
- Robots configuration.

Public pages should be indexable.

Private member information will never be exposed to search engines.

---

# 73. URL Structure

Examples:

```text
/about
/social-work
/social-work/blood-donation
/social-work/blood-donation/camp-2026
/events
/events/blood-donation-camp-2026
/gallery
/gallery/2026
/gallery/2026/blood-donation-camp
/members
/members/member-name
/management
/announcements
/announcements/example
/contact
```

URLs will remain human-readable.

---

# 74. Content Lifecycle

Most content follows:

```text
Create
 ↓
Review
 ↓
Publish
 ↓
Feature
 ↓
Archive
 ↓
Restore/Delete
```

Employee permissions determine which stages an employee can perform.

---

# 75. Homepage Statistics Refresh

After successful import:

```text
Import completed
      ↓
Recalculate affected statistics
      ↓
Update homepage
      ↓
Invalidate relevant cache
```

Manual overrides remain possible for the Super Admin.

---

# 76. Notification Workflow

Example:

```text
Admin creates announcement
        ↓
Schedules/publishes
        ↓
Selects "Send Notification"
        ↓
System prepares notification
        ↓
Admin reviews
        ↓
Admin clicks Send
        ↓
FCM sends to app users
        ↓
Notification opens announcement
```

No notification is sent merely because content was uploaded.

---

# 77. Contact Workflow

```text
Public submits form
       ↓
Spam validation
       ↓
Database
       ↓
Email notification
       ↓
Optional admin push
       ↓
Admin assigns employee
       ↓
Employee works on request
       ↓
Resolved
       ↓
Closed
```

---

# 78. Google Drive Failure Handling

If Drive is temporarily unavailable:

- Excel verification clearly reports the affected photo references.
- Accepted records without required photos are not silently imported if the photo is mandatory.
- The admin can retry.
- The system does not corrupt database records.
- Temporary failures are distinguished from permanent missing-file errors.

---

# 79. Import Transaction Safety

Accepted records will be imported using controlled transactions.

If a critical database failure occurs during import, the system will roll back the affected transaction rather than leaving half-written records.

Import batches will have unique IDs for traceability.

---

# 80. Idempotency

The system must safely handle accidental re-clicks.

Example:

Admin clicks:

**Upload Accepted Records**

twice.

The system must not create duplicate members/events.

Business IDs and import-batch controls prevent duplicate imports.

---

# 81. Reporting

Version 1 will provide operational reports rather than an expensive BI system.

Examples:

- Member count.
- Event count.
- Social Work count.
- Rejected imports.
- Import history.
- Notification history.
- Contact status.
- Audit history.

More advanced analytics can be added later.

---

# 82. Version 1 Scope

### Included

- Public website.
- Android app.
- iOS app.
- Admin Portal.
- Super Admin.
- Employees.
- Custom roles.
- Fine-grained permissions.
- Members.
- Current Management.
- Social Work.
- Events.
- Gallery.
- Announcements.
- Push notifications.
- Contact form.
- WhatsApp.
- Search.
- Filters.
- Homepage statistics.
- About/History.
- Achievements.
- Milestones.
- Excel templates.
- Excel validation.
- Accepted/rejected import.
- Rejected database.
- Google Drive.
- Image optimization.
- Object storage.
- Archive/restore/delete.
- Audit logs.
- Manual backup/restore.
- Accessibility.
- English.
- Hindi-ready data model.
- Offline mobile cache.

---

# 83. Explicitly Deferred

Not included initially:

- Public user accounts.
- Event registration.
- Social sharing.
- Online donations.
- Membership payments.
- SMS notification system.
- Targeted push notifications.
- Year-wise statistics.
- Full offline application.
- Separate leadership homepage section.
- Advanced BI analytics.

These can be added later without changing the core architecture.

---

# 84. Recommended Development Phases

## Phase 1 — Foundation

- Project setup.
- Database.
- Authentication.
- Permissions.
- Admin structure.
- Organization settings.
- Audit logging.

## Phase 2 — Members

- Member database.
- Categories.
- Public/private fields.
- Excel template.
- Import verification.
- Rejection system.
- Current Management.

## Phase 3 — Social Work + Events

- Categories.
- Activities.
- Events.
- Event status.
- Relationships.
- Search/filtering.

## Phase 4 — Gallery

- Albums.
- Photos.
- Google Drive integration.
- Image optimization.
- R2 storage.
- Lightbox.

## Phase 5 — Public Website

- Homepage.
- About.
- Members.
- Management.
- Social Work.
- Events.
- Gallery.
- Announcements.
- Contact.

## Phase 6 — Notifications

- FCM.
- Admin notification composer.
- Content-based notifications.
- Notification history.
- Deep links.

## Phase 7 — Mobile Apps

- Flutter app.
- Android.
- iOS.
- Offline cache.
- Push notifications.

## Phase 8 — Backup + Hardening

- Full backup.
- Google Drive backup.
- Restore.
- Security testing.
- Accessibility testing.
- Performance testing.
- Import stress testing.

## Phase 9 — Launch

- Production deployment.
- Domain.
- App Store.
- Google Play.
- Admin training.
- Data migration.
- Monitoring.

---

# 85. Acceptance Criteria

The system will not be considered ready until these critical workflows work reliably.

### Excel

```text
100 rows
95 valid
5 invalid

→ Verify
→ Admin sees 95/5
→ Upload accepted
→ 95 imported
→ 5 rejected Excel generated
→ 5 stored in rejection database
```

### Photo

```text
Excel photo reference
→ Verify Drive file
→ Accepted record
→ Download photo
→ Resize
→ Compress
→ Store optimized image
→ Display publicly
```

### Member privacy

```text
Phone = Private
→ Public API does not return phone
→ Website cannot display phone
→ Search cannot expose phone
```

### Management

```text
Current Management = Yes
→ Appears in Management page
→ Appears in Members page
```

### Notification

```text
Admin creates announcement
→ Reviews notification
→ Sends
→ All app users receive notification
→ Tap notification
→ Correct announcement opens
```

### Archive

```text
Archive record
→ Hidden publicly
→ Retained
→ Super Admin restores
→ Visible again
```

### Delete

```text
Super Admin
→ Delete
→ Confirmation
→ Permanent deletion
→ Audit entry
```

### Backup

```text
Super Admin
→ Backup Everything
→ Backup generated
→ Stored in Google Drive
→ Restore available later
```

---

# 86. Final Architectural Recommendation

The most important architectural principles are:

1. **One database as the source of truth.**
2. **Google Drive for originals and backups.**
3. **Object storage for optimized public images.**
4. **Strict Excel verification before import.**
5. **Rejected records stored permanently for traceability.**
6. **Configurable permissions rather than hard-coded employee roles.**
7. **Privacy enforced at the API/database level.**
8. **Member database drives Current Management.**
9. **Social Work drives related Events.**
10. **One Event has one Album containing multiple Photos.**
11. **Admin explicitly controls push notifications.**
12. **Public users require no account.**
13. **Search is available globally and within major sections.**
14. **English first, Hindi ready.**
15. **Accessibility is a first-class requirement.**
16. **Archive before destructive deletion.**
17. **Manual full backup/restore controlled by Super Admin.**
18. **Flutter for one Android/iOS codebase.**
19. **PostgreSQL instead of multiple databases.**
20. **Avoid expensive infrastructure until actual usage requires it.**

# 87. Immediate Next Step

The requirements are now sufficiently defined to move into **database and system design**.

The next deliverable should be:

**Database Schema + Entity Relationship Diagram + Excel Template Specifications + Permission Matrix**

That should be approved before implementation begins.