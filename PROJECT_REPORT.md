# StaffSync — Modern Human Resource Management System (HRMS)

## Title Page

**Project Title:** StaffSync — Modern Human Resource Management System  
**Submitted by:** Dushyant Pratap Singh  
**Programme:** B.Tech Computer Science and Engineering  
**Institution:** Medicaps University  
**Academic Year:** 2026–2027  
**Project Guide:** [To be filled in]

---

## Abstract
StaffSync is a web-based Human Resource Management System intended to organize common HR activities in one application. The implementation includes employee records, attendance check-in/check-out, leave requests and reviews, announcements, training programmes and enrolments, authentication, and a dashboard. The application uses a React frontend, an Express API, and MongoDB through Mongoose.

## 1. Introduction
Human-resource tasks can involve separate records and communication channels. StaffSync groups several common workflows into one interface and uses role-aware server endpoints to control access to selected operations.

## 2. Objectives
- Provide sign-in and current-user functionality.
- Maintain employee records.
- Record attendance check-in and check-out.
- Submit and review leave requests.
- Publish announcements.
- Create training programmes and manage enrolments.
- Present summary information on a dashboard.

## 3. Technology Stack
- **Frontend:** React 19, TypeScript, React Router, Vite, Tailwind CSS, lucide-react.
- **Backend:** Node.js, Express 4, TypeScript executed with `tsx`.
- **Database:** MongoDB and Mongoose.
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) and password hashing with `bcryptjs`.
- **Development integration:** Express hosts Vite middleware in the root development setup.

## 4. Architecture
The browser-based React client sends HTTP requests to Express endpoints under `/api`. The API uses middleware and controller logic, reads or writes MongoDB documents through Mongoose models, and returns JSON responses. See the SVG diagrams in `docs/diagrams/`.

## 5. Main Features
1. **Authentication:** Login, current-user (`/me`) and client-side logout.
2. **Employee management:** Search/filter the directory, create employee records, update details, and activate/deactivate accounts.
3. **Attendance:** Check-in, check-out, calculate work duration, view personal history, and provide an organization-wide view to HR Admins and Managers.
4. **Leave management:** Submit requests, calculate request duration, and approve/reject requests with review notes.
5. **Announcements:** HR Admins create, edit and archive announcements; other users see published announcements.
6. **Training:** HR Admins create/edit programmes; users can enrol subject to capacity and duplicate-enrolment checks; HR Admins and Managers can view participants.
7. **Dashboard:** A summary statistics endpoint.
8. **Health endpoint:** `/api/health` reports application/database status.

Feature access should be described according to the actual routes and role middleware. Do not claim features not present in the source.

## 6. Roles and Responsibilities
- **HR Admin:** Manages employee information, announcements and training programmes; reviews leave; can access permitted organization-level attendance and training views.
- **Manager:** Can access the organization-wide attendance view, review leave requests, and view training participants where permitted by the backend.
- **Employee:** Uses personal attendance and leave functions, views published announcements, and can enrol in training.

## 7. Data Model
The application has seven Mongoose models: `User`, `Employee`, `Attendance`, `LeaveRequest`, `Announcement`, `Training`, and `TrainingEnrollment`. `TrainingEnrollment` links users to training programmes. `Employee` may reference a `User`; attendance, leave, announcements, training, and enrolment records include the references described in `DATABASE_DOCUMENTATION.md`.

## 8. MVC Pattern
The code is organized in a controller/model/route style:
- **Models:** Define MongoDB document schemas and database operations.
- **Controllers:** Implement request handling and business logic.
- **Routes:** Map API paths and HTTP methods to middleware/controllers.
- **Views:** The user interface is implemented separately by React pages/components rather than server-rendered templates.
This is an MVC-inspired separation, not a claim that Express renders HTML views.

## 9. Project Setup and Execution
See `SETUP_GUIDE.md`. The root `npm run dev` command starts the Express server with Vite middleware on port 3000. Configure environment variables safely before use.

## 10. Limitations and Future Improvements
- No automated test suite was found in the inspected project files.
- Logout clears client-side state; it does not revoke an already-issued JWT on the server.
- Deactivation prevents new login but the authentication middleware does not re-check user status for every existing token.
- Leave balance tracking, overlapping-request validation, and a self-approval guard are not implemented.
- Attendance states such as `Absent`/`On Leave` are defined in the schema but are not automatically set by the reviewed workflow.
- Add request validation, rate limiting, restrictive CORS, stronger integration tests, and atomic capacity checks as future improvements.

## 11. Conclusion
StaffSync brings several everyday HR workflows into one web application. Its React frontend, Express API, and MongoDB data layer provide a foundation that can be expanded with improved validation, testing, security controls, and reporting.

## Appendix
Add genuine screenshots to `docs/screenshots/` and reference them in the final submitted report. Do not use fabricated UI images as proof of implemented functionality.
