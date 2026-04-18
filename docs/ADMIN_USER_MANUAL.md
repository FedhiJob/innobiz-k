# innobiz-k Ethiopia Admin User Manual

## 1. Purpose of This Manual

This manual is a complete operating guide for administrators of the `innobiz-k Ethiopia` platform. It explains what an admin can do in the system, how each area works, what happens after each action, and the practical rules to follow when managing applications, reports, office spaces, notifications, and space requests.

This is written for non-technical and semi-technical admin users. You do not need programming knowledge to use it.

---

## 2. What the Admin System Is Used For

The admin side of the platform is used to manage the core incubation workflow:

- reviewing startup applications
- approving or rejecting submitted applications
- monitoring startup monthly reports
- sharing monthly program reports with staff
- publishing homepage updates for visitors and startups
- managing office spaces shown on the public website
- reviewing office space requests
- managing admin profile and notification preferences

---

## 3. Admin Access and Role Rules

### 3.1 Who can use the admin system

Only users with the `ADMIN` role can access the admin dashboard and admin tools.

If a regular startup account tries to log in through the admin login page, access is blocked.

### 3.2 Admin entry point

Use the admin login page:

- `/admin/login`

After successful login, the system sends the admin to:

- `/admin/dashboard`

### 3.3 If login fails

Common reasons:

- incorrect email or password
- account is not an admin account
- account temporarily locked after too many failed login attempts
- backend service unavailable

If login succeeds but you still do not see admin pages, the account likely does not have the `ADMIN` role.

---

## 4. Admin Navigation Overview

After login, the admin top navigation provides access to the following sections:

- `Home`
- `Dashboard`
- `Applications`
- `Office Spaces`
- `Space Requests`
- `Profile`
- notification bell

On mobile devices, the same navigation is available through the hamburger menu.

### 4.1 What each section is for

- `Home`
  - returns to the public website homepage
- `Dashboard`
  - summary page for application counts, hero updates, reporting, and recent review activity
- `Applications`
  - full review queue for startup applications
- `Office Spaces`
  - manage the public office-space catalog shown on the website
- `Space Requests`
  - review public requests for office space or related resources
- `Profile`
  - update your admin name, email, and notification preferences
- notification bell
  - see unread in-app notifications and mark them as read

---

## 5. Dashboard

The dashboard is the admin’s main command center.

### 5.1 What appears on the dashboard

The dashboard contains:

- application statistics
- monthly report sharing tools
- hero updates feed management
- recent applications
- quick links to review queue and office-space management

### 5.2 Application statistics

The dashboard shows high-level counts for:

- `Total`
- `Draft`
- `Submitted`
- `Approved`
- `Rejected`

### 5.3 What the application statuses mean

- `Draft`
  - a startup started an application but has not submitted it
- `Submitted`
  - a startup submitted the application and it is ready for admin review
- `Approved`
  - the application was accepted by the admin team
- `Rejected`
  - the application was not approved

Important:

- only `Submitted` applications can be approved or rejected
- the system blocks illegal status transitions on the server side

---

## 6. Sharing the Monthly Admin Report

The dashboard includes a `Share Monthly Report` action. This opens the report sharing modal.

### 6.1 What the report-sharing tool does

It allows the admin to:

- generate a secure share link
- refresh the link
- share through WhatsApp
- share through Telegram
- send by email
- copy the report link
- open the report as print-ready PDF
- download the report in multiple formats
- use a QR code for mobile sharing

### 6.2 Available download formats

The report can be downloaded in:

- `PDF`
- `DOCX`
- `TXT`
- `CSV`

### 6.3 Share link behavior

The system creates a tokenized report share link.

The share link:

- has an expiration date
- can be refreshed
- is intended for controlled staff distribution

Maximum allowed share-link expiry:

- up to `90` days

### 6.4 Emailing the report

The admin can send the monthly report directly from the share modal by entering one or more recipient email addresses.

Rules:

- at least one valid email address is required
- multiple addresses can be entered
- the selected report format is attached/generated according to the system workflow

### 6.5 QR code behavior

When a report share link exists, the system generates a QR code for the current share URL. Staff can scan it on mobile devices to open the shared report directly.

### 6.6 Recommended usage

Use the report tool when:

- sharing a monthly performance summary with internal staff
- distributing a review copy before meetings
- sending a printable version to management
- sharing the same report through multiple communication channels

---

## 7. Hero Updates Feed Management

The dashboard includes a `Hero Updates Feed` section. These updates appear on the public homepage and are visible to:

- public visitors
- startups already signed in
- admins

This section is used like a controlled homepage feed for announcements and visual updates.

### 7.1 What an admin can do

The admin can:

- create a new hero update
- attach an image or video
- add optional CTA button text
- add optional CTA URL
- publish immediately
- save edits
- hide an existing update
- republish a hidden update
- delete an update

### 7.2 Fields in a hero update

- `Title`
  - required
  - minimum `3` characters
  - maximum `140` characters
- `Message`
  - required
  - minimum `5` characters
  - maximum `1000` characters
- `CTA Label`
  - optional
  - minimum `2` characters if used
  - maximum `80` characters
- `CTA URL`
  - optional
  - maximum `200` characters
- `Publish immediately`
  - checkbox
  - if enabled, the update becomes public

### 7.3 Supported hero media

Allowed file types:

- `JPG`
- `JPEG`
- `PNG`
- `WEBP`
- `GIF`
- `MP4`
- `WEBM`
- `MOV`

Maximum file size:

- `25 MB`

### 7.4 Practical publishing workflow

Recommended steps:

1. enter a concise title
2. write a short but informative message
3. attach an image or short video if needed
4. add CTA text and URL if the update should lead somewhere
5. keep `Publish immediately` enabled if it should go live now
6. click `Publish Update`

### 7.5 Edit, hide, publish, and delete actions

- `Edit`
  - opens the existing update in the form
- `Hide`
  - removes it from the public feed without deleting it
- `Publish`
  - makes a hidden update visible again
- `Delete`
  - permanently removes the update record

### 7.6 Best-practice guidance

- keep titles short and scannable
- use one update per topic
- prefer strong images over text-heavy announcements
- avoid duplicate updates for the same message
- use `Hide` when in doubt instead of deleting immediately

---

## 8. Recent Applications Panel

The dashboard includes a `Recent Applications` section.

This gives the admin a quick list of the most recent startup submissions and a direct path to full review.

Use this section when:

- triaging newly submitted applications
- jumping into the latest items without opening the full review queue
- identifying backlog growth quickly

---

## 9. Applications Review Queue

The `Applications` page is the main review workspace for startup applications.

### 9.1 What the page provides

The applications page allows the admin to:

- search applications
- filter by status
- paginate through the review list
- open a full application review page

### 9.2 Search and filter tools

Admins can search using:

- company name
- startup email
- founder email

Status filter options:

- `All`
- `Draft`
- `Submitted`
- `Approved`
- `Rejected`

### 9.3 Application list contents

Each record shows:

- company name
- startup email
- current status
- submitted date/time
- action link to view the application

---

## 10. Reviewing a Single Application

When the admin opens an application from the review queue, the `Application Review` page provides the full record.

### 10.1 What the detail page contains

The application detail page includes:

- startup information
- company information
- current status badge
- founders list
- uploaded application documents
- monthly reports submitted by the startup
- status timeline
- review actions
- rejection reason when applicable

### 10.2 Founders section

This section shows the people attached to the startup application.

Use it to confirm:

- names
- roles
- contact details
- primary founder information

### 10.3 Documents section

Admins can download application documents from this section.

The system supports startup-uploaded files such as:

- `PDF`
- `DOC`
- `DOCX`
- `PPT`
- `PPTX`

Maximum document size:

- `10 MB`

### 10.4 Monthly Reports section

If the startup has submitted monthly reports, they appear here.

Each monthly report contains:

- headline
- progress description
- report month
- attached report document

Admins can download the report files directly from this section.

Important system rule:

- a startup can only submit one monthly report per application per month

### 10.5 Status timeline

The status timeline is the application audit trail.

It records:

- previous status
- new status
- note or reason attached to the change
- time of status change

Use this section when:

- checking the history of an application
- confirming who changed the decision path
- auditing previous review actions

---

## 11. Approving an Application

### 11.1 When approve is available

The `Approve` action is only available when the application is in:

- `Submitted`

If an application is already approved, rejected, or still draft, the system blocks approval.

### 11.2 Approval workflow

1. open the application detail page
2. go to `Review Actions`
3. click `Approve`
4. enter optional admin notes
5. click `Confirm Approve`

### 11.3 What happens after approval

The system automatically:

- changes status to `APPROVED`
- records `reviewedAt`
- stores `reviewedBy`
- saves admin notes
- adds a status history entry
- sends an approval email to the startup
- creates an in-app notification for the startup if in-app notifications are enabled

---

## 12. Rejecting an Application

### 12.1 When reject is available

The `Reject` action is only available when the application is in:

- `Submitted`

### 12.2 Rejection workflow

1. open the application detail page
2. go to `Review Actions`
3. click `Reject`
4. enter the rejection reason
5. optionally enter admin notes
6. click `Confirm Reject`

### 12.3 Required rule

Rejection reason is mandatory.

### 12.4 What happens after rejection

The system automatically:

- changes status to `REJECTED`
- records `reviewedAt`
- stores `reviewedBy`
- saves the rejection reason
- saves optional admin notes
- adds a status history entry
- sends an update email to the startup
- creates an in-app rejection notification for the startup if enabled

---

## 13. Office Spaces Management

The `Office Spaces` page manages the public office-space catalog shown on the website.

This replaced the old static/manual approach. Spaces are now dynamic and admin-controlled.

### 13.1 What the admin can do

The admin can:

- create a new office space
- edit an existing office space
- upload or replace its cover image
- publish or hide the space
- control display order
- delete a space
- preview the public detail page

### 13.2 Fields used to create or edit a space

#### Required fields

- `Name`
  - minimum `2`
  - maximum `120` characters
- `Short description`
  - minimum `10`
  - maximum `220` characters
- `Full details`
  - minimum `20`
  - maximum `4000` characters

#### Optional fields

- `Location label`
  - maximum `80` characters
- `Capacity`
  - whole number
  - minimum `1`
  - maximum `5000`
- `Amenities`
  - list of amenities
  - up to `20` items
- `Sort order`
  - whole number
  - minimum `0`
  - maximum `999`
- `Published`
  - checkbox
- `Cover image`
  - optional image upload

### 13.3 Office-space image rules

Allowed image types:

- `JPG`
- `JPEG`
- `PNG`
- `WEBP`

Maximum image size:

- `10 MB`

### 13.4 Publish vs hide behavior

- `Published`
  - the office space is visible on the public website
  - it can be selected by users during space requests
- `Hidden`
  - the office space remains in admin records
  - it is not shown publicly
  - users cannot newly request it from the public side

### 13.5 Sort order

Spaces are displayed according to `sortOrder`, then creation order.

Use lower numbers for higher priority placement.

Example:

- `0` for the most important space
- `1` for the next one
- `2` for the next one

### 13.6 Public detail pages

Every published office space has a public detail page.

From the public side, users can:

- open the detail page
- read the full description
- see location/capacity/amenities
- click `Apply for this Space`

That button leads directly into the space-request workflow with the chosen space preselected.

### 13.7 Delete behavior

Deleting a space removes it from the office-space catalog.

Use delete carefully. If a space may be used again later, hiding it is usually safer than deleting it.

---

## 14. Space Requests Review

The `Space Requests` page is used to review public requests for workspace or other support resources.

### 14.1 What admins can do

The admin can:

- view all space requests
- filter by status
- review request details
- approve a pending request
- reject a pending request

### 14.2 Status options

- `Pending`
- `Approved`
- `Rejected`

### 14.3 Information shown in each request

Each request can include:

- startup name
- contact name
- email
- phone number
- preferred office space
- requested resource types
- team size
- start date
- end date
- purpose
- additional notes
- current status

### 14.4 Approving a space request

Rules:

- only `Pending` requests can be approved

Workflow:

1. open the `Space Requests` page
2. find the request
3. click `Approve`

Optional:

- admin notes may be stored when the backend/UI supports the action payload

What happens after approval:

- status changes to `APPROVED`
- review timestamp is saved
- reviewer identity is saved

### 14.5 Rejecting a space request

Rules:

- only `Pending` requests can be rejected
- rejection reason is required

What happens after rejection:

- status changes to `REJECTED`
- rejection reason is saved
- reviewer identity and review time are saved

### 14.6 Notification behavior

When a public user submits a new space request, admins receive an in-app notification if in-app notifications are enabled.

---

## 15. Notifications

The admin notification system has two parts:

- the notification bell
- the notification settings page

### 15.1 Notification bell

The bell in the admin header shows unread in-app alerts.

Admins can:

- open the latest notifications
- view unread count
- mark all notifications as read
- open notification settings

### 15.2 Notification settings page

The `Admin Notification Settings` page lets the admin choose how alerts are received.

Current preferences:

- `In-app notifications`
- `Email notifications`

### 15.3 Notifications currently generated by the system

The platform includes notification types for:

- application submitted
- application approved
- application rejected
- document uploaded
- monthly report submitted
- space request submitted

### 15.4 Important behavior

If an admin disables `In-app notifications`, the system will not create new in-app notifications for that admin.

---

## 16. Profile Management

The admin profile page is used to manage account-level settings.

### 16.1 What can be updated

- name
- email
- in-app notification preference
- email notification preference

### 16.2 Logout

The `Logout` button signs the admin out and returns them to:

- `/admin/login`

### 16.3 Recommended admin profile practice

- keep the admin name accurate for accountability
- keep the email active and monitored
- enable notifications if you are part of the review workflow

---

## 17. System Emails and Automated Actions

The platform automates part of the communication workflow.

### 17.1 Emails triggered by application workflow

The system includes templates for:

- application received
- application approved
- application update/rejection
- monthly admin report

### 17.2 Emails triggered by admin actions

When the admin approves or rejects an application, the system sends email to the startup and logs the email action.

### 17.3 Email logging

Application detail records include email logs. This helps admins confirm whether a system email was attempted and what type of email was sent.

---

## 18. File and Upload Rules Summary

### 18.1 Hero update media

- allowed:
  - JPG
  - JPEG
  - PNG
  - WEBP
  - GIF
  - MP4
  - WEBM
  - MOV
- max size:
  - `25 MB`

### 18.2 Office-space images

- allowed:
  - JPG
  - JPEG
  - PNG
  - WEBP
- max size:
  - `10 MB`

### 18.3 Startup documents and monthly report files reviewed by admins

- allowed:
  - PDF
  - DOC
  - DOCX
  - PPT
  - PPTX
- max size:
  - `10 MB`

---

## 19. Recommended Daily Admin Workflow

This is the recommended working rhythm for a normal admin day.

### 19.1 Start of day

1. log in to `/admin/login`
2. open the dashboard
3. check:
   - unread notifications
   - submitted application count
   - recent applications
   - new space requests
   - new monthly reports

### 19.2 Review queue

1. open `Applications`
2. filter by `Submitted`
3. review the newest applications first
4. open each application detail page
5. verify founders, documents, and status timeline
6. approve or reject with clear notes

### 19.3 Content and communications

1. return to the dashboard
2. publish or update homepage hero announcements if needed
3. generate the monthly report share link when internal reporting is needed
4. email or share the report with the required staff

### 19.4 Space administration

1. review `Space Requests`
2. process pending requests
3. update `Office Spaces` if availability, naming, or descriptions changed

---

## 20. Best Practices for Clean Administration

### 20.1 Application decisions

- write clear approval notes when context matters
- make rejection reasons specific enough to be useful
- never approve or reject without checking supporting documents

### 20.2 Hero updates

- keep public messages concise
- use visual updates only when they add value
- avoid leaving outdated announcements published for too long

### 20.3 Office spaces

- use high-quality cover images
- keep amenities accurate
- keep sort order intentional
- hide unavailable spaces instead of deleting them unless removal is final

### 20.4 Reports

- refresh share links when needed for controlled access
- use PDF for formal sharing
- use CSV for spreadsheet-based staff analysis
- use DOCX or TXT when editing is required

### 20.5 Notifications

- keep in-app notifications enabled if you are part of active daily operations
- mark all as read only after reviewing them

---

## 21. Troubleshooting Guide

### 21.1 I cannot log in as admin

Check:

- correct admin email
- correct password
- account has `ADMIN` role
- backend is running and reachable

### 21.2 An application cannot be approved or rejected

Likely cause:

- it is not in `Submitted` status

The platform blocks invalid transitions intentionally.

### 21.3 I uploaded a hero update but it is not visible publicly

Check:

- `Publish immediately` was enabled, or the update is currently published
- the media file type is supported
- the backend upload storage is active

### 21.4 A public office space is missing from the website

Check:

- the space is published
- it has not been deleted
- the frontend is using current backend data

### 21.5 I cannot select a space in a new request

Likely cause:

- the office space is hidden or deleted

### 21.6 A report link does not work

Check:

- the link has not expired
- the format is supported
- the backend service is online

### 21.7 Notifications are not appearing

Check:

- `In-app notifications` is enabled in profile/settings
- you are logged into the correct admin account
- the triggering action actually happened

---

## 22. Security and Governance Notes

- admin access should be restricted to authorized staff only
- admin credentials should never be shared casually
- use clear notes and reasons to preserve decision accountability
- treat report links as controlled distribution links, not public permanent links
- keep admin email addresses current so notification and reporting flows remain reliable

---

## 23. Quick Reference Checklist

### Daily checklist

- log in
- check unread notifications
- review submitted applications
- process pending space requests
- check new monthly reports
- update homepage content if necessary

### Weekly or monthly checklist

- generate and distribute the monthly admin report
- review published hero updates for freshness
- verify office-space listings are current
- confirm notification settings are still correct

---

## 24. Appendix: Admin Capabilities Summary

### Admin can do

- log in as admin
- view dashboard metrics
- search and filter applications
- open full application records
- approve submitted applications
- reject submitted applications
- review founders, documents, monthly reports, and status timeline
- manage homepage hero updates
- share monthly admin reports
- email monthly reports to staff
- generate QR-based report sharing
- manage office spaces
- review and process space requests
- manage profile and notification preferences
- mark notifications as read

### Admin cannot do

- approve or reject an application unless it is `Submitted`
- approve or reject a space request unless it is `Pending`
- use a non-admin account to access admin pages
- upload unsupported media or document types

---

## 25. Final Note

The admin system is designed to support real operational work, not just record keeping. The best results come from using it consistently:

- review promptly
- write clean notes
- keep public information current
- distribute reports intentionally
- treat every status change as an auditable decision

If needed later, this manual can also be converted into:

- PDF
- DOCX
- branded client-facing handbook
- onboarding checklist for new admin staff
