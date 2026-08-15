# ASRGH.COM — V2 UAT Test Scenarios

## Public website

- [ ] Home page opens with the correct ASRGH logo.
- [ ] Organization name reads **Aggarwal Sabha Rohini Group Housing**.
- [ ] Website identity reads **ASRGH.COM**.
- [ ] Important announcement is visible.
- [ ] Statistics show populated test values.
- [ ] Upcoming events are visible.
- [ ] Announcement cards are populated.
- [ ] About page contains history, mission, vision and milestones.
- [ ] Social Work shows multiple categories/activities.
- [ ] Events can be filtered by status.
- [ ] Event detail shows date, time and venue.
- [ ] Event detail explicitly identifies its single album.
- [ ] Event album contains multiple photographs.
- [ ] Gallery can filter by album.
- [ ] Photo lightbox opens.
- [ ] Member directory is populated.
- [ ] Member search works.
- [ ] Current Management contains only members marked as management.
- [ ] Announcements page is populated.
- [ ] Contact form can be submitted.
- [ ] Submitted contact appears in Admin → Contact Requests.
- [ ] Mobile layout is usable.

## Admin

- [ ] Admin Portal opens without terminal access.
- [ ] Dashboard contains populated metrics.
- [ ] Members table is populated.
- [ ] Add test member works.
- [ ] Current Management remains member-driven.
- [ ] Events & Albums shows one album per event.
- [ ] Existing album photo counts are visible.
- [ ] Upload Photos accepts multiple local images.
- [ ] Uploaded images appear in the selected event album.
- [ ] Public event gallery reflects the newly uploaded photos.
- [ ] Social Work is populated.
- [ ] Announcements are populated.
- [ ] Draft announcement can be created.
- [ ] Excel Import shows test batches.
- [ ] Accepted/rejected counts are visible.
- [ ] Validation simulation creates rejected records.
- [ ] Rejected Records shows row, reference, reason and suggested fix.
- [ ] Rejected records can be downloaded.
- [ ] Contact requests are visible.
- [ ] Contact status can be changed.
- [ ] Notification test action works.
- [ ] Audit Log records administrative actions.
- [ ] Settings can be edited.
- [ ] Reset UAT data restores the original dataset.

## Critical business rule

The following must remain true throughout UAT:

**One Event → One Album → Multiple Photos**

Do not introduce a workflow that allows an administrator to create multiple albums for the same event.

## UAT acceptance recommendation

Approve the frontend only after:

1. Public navigation is accepted.
2. Admin navigation is accepted.
3. Event/album/photo workflow is accepted.
4. Excel accepted/rejected workflow is accepted.
5. Contact workflow is accepted.
6. Current Management behavior is accepted.
7. Branding and terminology are accepted.

After approval, freeze the UI workflow and derive the final backend/API/database implementation from it.
