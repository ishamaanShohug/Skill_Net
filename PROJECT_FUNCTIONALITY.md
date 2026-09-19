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

The top search box and profile dropdown arrow are currently visual elements and do not perform a global search or open a menu.

## 7. Job Seeker dashboard

### Overview — Partial

Route: `/job-seeker`

The overview contains:

- Profile-completion presentation
- Summary cards for applications, profile views, assessments, and courses
- Live recommended/latest jobs from the API
- Recent activity presentation
- Application-progress presentation
- Course-progress presentation

Only the job list is currently live. Summary counts, activity, application preview, match percentages, and learning progress are demonstrational.

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

### Profile — Prototype UI; backend profile API available

Route: `/job-seeker/profile`

The interface covers:

- Personal information
- Professional headline and summary
- Contact and location information
- Education
- Work experience
- Skills
- Certificates and document upload
- Profile-completion indicator

The backend can retrieve and update the core seeker profile, but the current page uses demonstration values and does not yet submit the form. Separate create/update endpoints are still needed for education, experience, and certificates.

### CV builder — Prototype

Route: `/job-seeker/cv`

The UI allows the user to choose:

- CV sections
- Accent colour
- Template style
- CV preview

Generate CV and Download PDF currently show informational messages. There is no PDF-generation backend endpoint yet.

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

### My learning — Partial

Route: `/job-seeker/learning`

The designed page includes:

- Enrolled courses
- Current course
- Completion percentage
- Completed-module count
- Resume-course action

The page loads the signed-in user's enrollments and stored progress fields. Completing modules and updating progress from the frontend are not yet implemented.

### Notifications — Live

Route: `/job-seeker/notifications`

The backend supports:

- Listing a user's notifications
- Marking one notification as read
- Marking all notifications as read

The page loads the signed-in user's notifications and persists both single-notification and mark-all read actions through the API.

### Messages — Prototype UI; live API available

Route: `/job-seeker/messages`

The backend can list conversations belonging to the user and add messages to a conversation. The current page uses fixed contacts and local messages, so messages typed in the UI are not yet persisted.

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

The displayed metrics and recent applicants are currently demonstration data.

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
- Optional assessment attachment

The form loads existing data when editing, retrieves selectable skills from the API, and saves a draft or publishes a job through PostgreSQL.

### Applicants — Prototype UI; application API available

Route: `/employer/applicants`

The interface includes:

- Applicant search
- Role filtering
- Candidate details
- Assessment scores
- Skills
- Send-message action
- Move-to-interview action

The backend can list applications belonging to the employer's jobs and change an application's status while notifying the candidate. The page is not yet connected to those operations.

### Quiz builder — Prototype

Route: `/employer/quizzes`

The interface supports adding/removing questions, editing question text, selecting correct answers, assigning marks, selecting a job, and displaying the pass mark. The backend currently exposes quizzes as read-only, so quiz/question/option creation endpoints must be added before Save can persist data.

### Company profile — Prototype UI; backend profile API available

Route: `/employer/profile`

The page covers company name, website, industry, headquarters, description, and branding. The backend can retrieve and update the employer profile, but the current form is not connected.

### Employer notifications and messages — Prototype UI; live APIs available

Routes:

- `/employer/notifications`
- `/employer/messages`

These reuse the shared notification and messaging interfaces described above.

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

To make every visible dashboard control fully operational, the remaining priorities are:

1. Connect seeker profile forms and add CRUD endpoints for education, experience, and certificates.
2. Replace the fixed quiz UI with live questions, application IDs, quiz IDs, and API answer submission.
3. Connect recommendations, enrollments, progress tracking, notifications, and messages.
4. Connect employer job CRUD, applicants, status transitions, messages, and company profile.
5. Add employer quiz-builder CRUD endpoints and integrate the builder.
6. Connect the administrator dashboard to live analytics.
7. Add administrator APIs for user management, job/course moderation, and moderation reports.
8. Add report generation/export and CV PDF generation.
9. Connect a real payment gateway and payment callback flow for paid courses.
10. Replace remaining visual-only filters, pagination, global search, and dashboard counters with live behavior.

This checklist represents the difference between the current implemented system and the complete behavior presented by every screen in the frontend.
