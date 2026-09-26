# SkillNet Project Functionality Guide

## 1. Project overview

SkillNet is a role-based recruitment, skills-assessment, and learning platform. It connects job seekers, employers, course providers, and platform administrators through a React frontend and a Django REST API backed by PostgreSQL.

The application has three visible dashboard workspaces:

- Job Seeker dashboard
- Employer dashboard
- Administrator dashboard

Course providers exist as a backend role, but there is not currently a dedicated course-provider dashboard route in the frontend.

## 2. Technology and data flow

- Frontend: React, React Router, Axios, Vite, Recharts, and Lucide icons
- Backend: Django, Django REST Framework, Simple JWT, filtering, and OpenAPI documentation
- Database: PostgreSQL
- Authentication: JWT access and refresh tokens
- API base URL: `http://localhost:8000/api`
- Frontend URL: `http://localhost:5173`
- API documentation: `http://localhost:8000/api/docs/`
- Django administration: `http://localhost:8000/admin-site/`

The frontend is configured with `VITE_USE_MOCK_API=false`, so supported service calls use the Django API and PostgreSQL database.

## 3. Implementation-status legend

This document uses the following labels:

- **Live:** Connected to the Django API and PostgreSQL.
- **Partial:** Some information or actions are live, while other content or controls are demonstrational.
- **Prototype:** The interface is present, but its data and actions are currently local/static and are not saved in PostgreSQL.

## 4. Authentication and access control

### Registration — Live

Users can register as either a job seeker or employer.

Registration collects:

- Full name
- Company name for employers
- Email address
- Password
- Role
- Terms acceptance in the frontend

The backend validates the password, creates the user, creates the matching seeker or employer profile, and returns JWT access and refresh tokens.

### Login — Live

Users log in with email and password. On success:

- The backend returns the user record and JWT tokens.
- Tokens and user information are kept in browser session storage.
- The user is redirected to the dashboard matching their role.
- Expired access tokens can be refreshed automatically.

### Logout — Live

Logout blacklists the refresh token, clears the browser session, and returns the user to the public site.

### Route protection — Live

Dashboard routes are role-restricted:

- `JOB_SEEKER` can access `/job-seeker/*`.
- `EMPLOYER` can access `/employer/*`.
- `ADMIN` can access `/admin/*`.

Users who are not authenticated are redirected to login. Users attempting to access another role's dashboard are redirected to their own dashboard.

## 5. Public website

### Home page — Partial

The home page provides:

- Hero job search
- Featured job previews loaded from the API
- Featured course previews loaded from the API
- Platform journey explanation
- Skills-assessment introduction
- Employer call to action
- Registration and navigation links

Job and course data is live. Marketing statistics, partner names, candidate examples, and visual assessment examples are static presentation content.

### Job directory — Partial

Route: `/jobs`

Functions include:

- Load published jobs from PostgreSQL
- Keyword filtering by job title, company, and skills
- Job-type selection
- Job cards linking to job details
- Loading, empty, and error states

Category checkboxes, location filtering, sorting, location detection, reset, and visual pagination are currently frontend-only controls.

### Job details — Live

Route: `/jobs/:id`

Displays:

- Employer/company
- Job title
- Location and job type
- Salary range
- Description and requirements
- Required skills
- Experience and category
- Whether an assessment is attached

Authenticated job seekers can apply. The backend:

- Prevents duplicate applications
- Assigns `APPLIED` or `ASSESSMENT_PENDING`
- Creates application history
- Notifies the employer

For jobs with an assessment, the frontend passes the returned application ID and the job's quiz ID into the assessment route. Jobs without an assessment go directly to the application list.

### Course directory — Partial

Route: `/courses`

Functions include:

- Load published courses from PostgreSQL
- Search by title, skill, or provider
- Display price, rating, duration, modules, and provider
- Link to course details

Category and price filters are currently visual controls only.

### Course details — Partial

Route: `/courses/:id`

Displays course information and modules from the API. A job seeker can enroll in a free course. Paid courses return a checkout requirement, but an external payment gateway is not yet connected.

## 6. Shared dashboard layout

All role dashboards provide:

- Role-specific sidebar navigation
- Responsive mobile navigation
- Current-page title
- Notification shortcut
- Signed-in user name and initials
- Logout action

The user avatar/name in the top bar links to the signed-in user's own profile page (Job Seeker and Employer only — there is no Administrator profile page yet, so it's not clickable for that role). The top search box is still a visual element and does not perform a global search.

## 7. Job Seeker dashboard

### Overview — Live

Route: `/job-seeker`

The overview contains:

- Profile-completion indicator, computed from the signed-in seeker's actual profile fields
- Summary cards for active applications, profile strength, assessments taken (with average score), and courses in progress
- Live recommended/latest jobs from the API
- Recent activity, sourced from the signed-in user's live notifications
- Application-progress preview, sourced from the signed-in user's live applications
- Course-progress card, sourced from the signed-in user's live enrollments

All cards and panels are live. The per-job "match percentage" that previously appeared on job cards was removed, since no skill-matching endpoint exists to back it.

### Applications — Live

Route: `/job-seeker/applications`

The page loads only the signed-in seeker's applications and displays:

- Job and company
- Application and update dates
- Current status
- Hiring-stage progress
- Quiz score when available
- Status filters such as Applied, Shortlisted, Interview, and Rejected

Backend application states include Applied, Assessment Pending, Under Review, Shortlisted, Interview, Offer, Hired, Rejected, and Withdrawn.

### Profile — Live

Route: `/job-seeker/profile`

The interface covers:

- Personal information (name, phone, headline, location, portfolio URL, summary), saved through the profile API
- Education, work experience, and certificates, each with its own create/update/delete endpoint (`/api/profile/education/`, `/api/profile/experience/`, `/api/profile/certificates/`), scoped to the signed-in seeker
- Skills, added or removed against the shared skills list and persisted to the profile
- Certificate document upload (PDF/JPG/PNG)
- Profile-completion indicator, computed from how many profile sections are filled in

### CV builder — Live

Route: `/job-seeker/cv`

The UI allows the user to choose:

- CV sections to include
- Accent colour
- Template style (modern or classic)
- CV preview, rendered from the signed-in seeker's live profile data

Download PDF calls a backend PDF-generation endpoint (`POST /api/users/cv/`, built with ReportLab) that assembles the selected sections into a downloadable CV.

### Skills assessment — Live

Route: `/job-seeker/quiz/:id`

The assessment flow includes:

- Question-by-question navigation
- Answer selection
- Progress display
- Timer presentation
- Assessment submission

Questions and answer options are loaded from the selected quiz in PostgreSQL. The frontend sends the real application ID and selected option IDs. The backend validates ownership, enforces maximum attempts, calculates scores, detects skill gaps, updates application status, and returns recommended courses.

### Quiz result — Live

Route: `/job-seeker/quiz/:id/result`

Displays:

- Pass/fail result
- Score and percentage
- Required pass mark
- Detected skill gaps
- Links to applications or recommendations

It displays the stored result returned by the live assessment submission.

### Recommendations — Live

Route: `/job-seeker/recommendations`

The page loads published courses recommended from skills missed in the signed-in user's submitted assessments.

### My learning — Live

Route: `/job-seeker/learning`

The page includes:

- Enrolled courses
- Current course, selectable from the enrolled-courses list
- Completion percentage
- A module checklist with a "Mark complete" action per module

Marking a module complete calls `POST /api/enrollments/:id/complete_module/`, which records the completed module, recalculates progress, flags the enrollment as completed once every module is done, and notifies the seeker.

### Notifications — Live

Route: `/job-seeker/notifications`

The backend supports:

- Listing a user's notifications
- Marking one notification as read
- Marking all notifications as read

The page loads the signed-in user's notifications and persists both single-notification and mark-all read actions through the API.

### Messages — Live

Route: `/job-seeker/messages`

The page loads the signed-in user's real conversations and messages, and persists messages typed in the UI through the API. A conversation between a candidate and the hiring employer is created automatically when the candidate applies to a job.

## 8. Employer dashboard

### Overview — Prototype

Route: `/employer`

The overview presents:

- Active-job count
- Application count
- Shortlisted count
- Recent applicants
- Hiring funnel
- Create-job shortcut

The "Recent applicants" panel now loads the employer's real, most recent applicants from PostgreSQL. The stat cards (active-job/application/shortlisted counts) and hiring funnel are still demonstration data.

### Manage jobs — Live

Route: `/employer/jobs`

The interface provides:

- Search jobs
- Filter by status
- View a public listing
- Edit a job
- Delete/archive confirmation
- Create-job shortcut

The management table loads only the signed-in employer's jobs from PostgreSQL. It supports search, status filtering, public job preview, edit navigation, and deletion. Backend ownership checks prevent an employer from listing or deleting another employer's job.

### Create or edit job — Live

Routes:

- `/employer/jobs/create`
- `/employer/jobs/:id/edit`

The form covers:

- Job title and category
- Job type and location
- Salary and experience
- Description and requirements
- Required skills
- Draft or published state
- A link to attach or edit the job's assessment in the Quiz builder (available once the job has been saved)

The form loads existing data when editing, retrieves selectable skills from the API, and saves a draft or publishes a job through PostgreSQL.

### Applicants — Live (Smart CV Shortlisting)

Route: `/employer/applicants`

The employer picks one of their jobs, and the page calls `GET /api/jobs/:id/ranked-applicants/` to load every applicant scored and sorted by a transparent **fit score**:

- **Fit score** = Skills × weight + Quiz × weight + Experience × weight (default 50/30/20, adjustable per search — weights don't need to sum to 100, they're normalized automatically). Computed deterministically in `backend/skillnet/scoring.py`, no external calls.
  - Skills: the fraction of the job's required skills the candidate has.
  - Quiz: the candidate's best submitted attempt for that application.
  - Experience: years of relevant experience (current roles counted to today, capped) blended with keyword overlap between the job's title/requirements and the candidate's experience.
  - If the job has no quiz, or required skills, or the candidate never attempted the quiz, that component is dropped (not scored as zero) and its weight is redistributed proportionally across the rest.
- **Must-have skills**: the employer can mark specific required skills as non-negotiable. A candidate missing one is flagged `knocked_out` and ranked last — never auto-rejected, still visible and actionable.
- Each result includes a plain-English explanation (e.g. "Matches 2/3 required skills, missing Communication; quiz 100%; 7.7 yrs relevant experience.") plus matched/missing skill lists.
- A candidate CV view (headline, summary, location, skills, work experience, education, certificates, cover letter, quiz score, and the fit-score breakdown) loaded from the candidate's real profile and application data.
- Status actions (Shortlist / Move to interview / Extend offer / Mark hired / Reject), a bulk mode (select multiple candidates to shortlist/reject/compare at once), and a side-by-side compare view — all persisting through the same status-update endpoint the seeker's Applications page reads from, and notifying the candidate.
- A "Send message" action that opens the shared Messages page on the conversation automatically created for that application.

When a seeker applies, the backend saves a snapshot of their profile (`cv_snapshot`) and their chosen CV template/sections (`cv_options`) onto the `Application` record, so scoring and CV review reflect what the candidate looked like at apply time rather than their possibly-since-edited profile. Both fields are optional — the apply flow, and scoring, work the same with or without them (scoring falls back to the candidate's live profile if no snapshot exists). Ranking is scoped to the signed-in employer's own jobs; backend ownership checks prevent viewing or ranking another employer's applicants.

### Quiz builder — Live

Route: `/employer/quizzes` (optionally `?job=<id>` to preselect a job, e.g. from the job form)

The interface supports adding/removing questions, editing question text and answer options, marking the correct option, assigning marks, choosing a skill per question, selecting which of the employer's jobs to attach the assessment to, and setting the pass mark and duration. Selecting a job that already has an assessment loads it for editing; selecting one without an assessment starts a blank quiz. Save persists the quiz (and fully replaces its questions on every save) through the API and attaches it to the selected job — each job can have at most one assessment. Only the employer who owns the job can create, edit, or delete its assessment.

### Company profile — Live

Route: `/employer/profile`

The page loads and saves the signed-in employer's real company profile: company name, website, industry, headquarters, description, and a logo upload — through the same profile endpoint the seeker's My Profile page uses (the backend branches by role). Approval status is shown next to the industry line.

### Employer notifications and messages — Live

Routes:

- `/employer/notifications`
- `/employer/messages`

These reuse the shared notification and messaging interfaces described above, which are now connected to the live APIs.

## 9. Administrator dashboard

### Overview — Prototype UI; analytics API available

Route: `/admin`

The dashboard presents:

- Total users
- Active jobs
- Applications
- Course enrollments
- Platform growth chart
- User-role distribution
- Moderation and approval queues
- Outcome summary

The backend analytics endpoint returns live totals and popular jobs/courses, but the current dashboard charts and cards use demonstration values.

### User management — Prototype

Route: `/admin/users`

The interface supports searching, role filtering, status display, user details, and a deactivate-account action. A dedicated administrator user-management API is not currently implemented.

### Job moderation — Prototype

Route: `/admin/jobs`

The interface displays jobs, companies, dates, publication status, report counts, and moderation actions. Dedicated admin moderation operations and audit recording still need to be exposed to the frontend.

### Course management — Prototype

Route: `/admin/courses`

The interface displays provider, price, rating, status, preview, approval, and menu actions. Course approval/removal workflow endpoints are not yet implemented for this page.

### Reports and analytics — Prototype

Route: `/admin/reports`

The page provides date, report-type, and region controls plus applications, hires, and category charts. Report filters and Download Report are not yet connected to a generated report endpoint.

### Moderation queue — Prototype

Route: `/admin/moderation`

The interface includes open/resolved/audit tabs, priority labels, report reasons, listing previews, dismiss actions, and listing removal. The `ModerationReport` database model exists, but API endpoints and frontend integration are not yet implemented.

### Administrator notifications — Prototype UI; live API available

Route: `/admin/notifications`

This reuses the shared notifications page. Backend notification operations exist, but the page is not yet connected.

## 10. Backend API functionality

### Users and profiles

- Register job seekers and employers
- Authenticate by email/password
- Refresh and blacklist JWT tokens
- Retrieve/update seeker or employer profile
- Enforce role-based API permissions

### Jobs and applications

- Public listing and retrieval of published jobs
- Search, filtering, and ordering support
- Employer job CRUD
- Job-seeker application creation
- Duplicate-application prevention
- Employer-only application status updates
- Status-history records
- Candidate/employer notifications

### Assessments

- Retrieve active quizzes and questions
- Hide correct-answer information from candidates
- Validate submitted options
- Enforce attempt limits
- Calculate marks, percentage, and pass/fail
- Record candidate answers
- Detect failed skills
- Update the linked application
- Return recommended courses

### Courses and learning

- Public published-course listing and retrieval
- Provider/admin course creation support
- Free-course enrollment
- Paid-course checkout placeholder
- User enrollment listing
- Skill-gap course recommendations

### Communication

- User-specific conversation listing
- Message creation within authorized conversations
- User-specific notifications
- Mark-one and mark-all read actions

### Administration

- Live aggregate analytics for users, jobs, applications, courses, enrollments, and popular content
- Django administrator interface for direct database management
- Moderation-report database model

## 11. Database entities

The PostgreSQL database stores:

- Users and role information
- Job seeker and employer profiles
- Skills
- Education, experience, and certificates
- Jobs and required skills
- Applications and status history
- Quizzes, questions, and answer options
- Quiz attempts and candidate answers
- Courses and modules
- Enrollments and progress
- Conversations and messages
- Notifications
- Payments
- Moderation reports
- Django authentication, session, migration, and token-blacklist records

## 12. Demo accounts

All seeded demo accounts use the password `DemoPass123!`.

| Role | Email |
|---|---|
| Job seeker | `seeker@skillnet.demo` |
| Employer | `employer@skillnet.demo` |
| Course provider | `provider@skillnet.demo` |
| Administrator | `admin@skillnet.demo` |

## 13. Remaining functionality checklist

The job seeker dashboard is now fully connected end to end: profile (including education, experience, certificates, and skills CRUD), CV builder with PDF generation, my learning progress tracking, messages, and a live overview are all live.

The employer dashboard is now fully connected end to end too: job CRUD, applicants (with Smart CV Shortlisting), status transitions, the quiz builder, messages/notifications, and the company profile (including logo upload) are all live.

To make every remaining visible dashboard control fully operational, the outstanding priorities are:

1. Connect the administrator dashboard to live analytics.
2. Add administrator APIs for user management, job/course moderation, and moderation reports.
3. Add report generation/export for the administrator reports page.
4. Connect a real payment gateway and payment callback flow for paid courses.
5. Replace remaining visual-only filters, pagination, global search, and dashboard counters with live behavior.

This checklist represents the difference between the current implemented system and the complete behavior presented by every screen in the frontend.
