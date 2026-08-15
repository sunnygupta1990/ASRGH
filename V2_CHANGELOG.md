# ASRGH V2 Change Log

## What was retained from Gemini

- React/Vite structure
- Public page architecture
- Admin portal architecture
- Central AppContext data layer
- Seed data
- RBAC-oriented employee/role model
- Excel validation engine
- Import batches
- rejected records
- audit logging
- contact management
- notification workflow
- accessibility controls
- event/photo data model

## What was corrected

### Identity
- Replaced incorrect organization names with:
  **Aggarwal Sabha Rohini Group Housing**
- Set website identity to:
  **ASRGH.COM**
- Replaced the logo with the supplied ASRGH logo.

### Events / Albums
- Added explicit `album_code` and `album_name` metadata to event records.
- Preserved the one-event/one-album rule.
- Updated public event detail to call the collection an Event Album.
- Reworked Admin Gallery into an Albums & Photos workflow.

### Photo upload
- Removed the URL-only admin workflow.
- Added multiple local image selection.
- Added previews and per-image removal.
- Converted selected images to browser data URLs for frontend-only UAT persistence.
- Added a multi-photo context action.

### UAT
- Seeded rejected records.
- Seeded import batches.
- Added a dependency-free standalone UAT demo.
- Added a detailed UAT test scenario document.
