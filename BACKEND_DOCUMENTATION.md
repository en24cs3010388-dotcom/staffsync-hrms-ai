# Backend Documentation

## 1. Overview
The root backend is a Node.js/Express API written in TypeScript. The root entry point is `server.ts`, executed by `tsx` using the `npm run dev` script. Express serves the Vite client in development and mounts API endpoints under `/api`.

## 2. Backend Structure
```text
server.ts
server/
├── config/
│   ├── db.ts
│   └── seed.ts
├── controllers/
│   ├── announcementController.ts
│   ├── attendanceController.ts
│   ├── authController.ts
│   ├── dashboardController.ts
│   ├── employeeController.ts
│   ├── leaveController.ts
│   └── trainingController.ts
├── middleware/
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── roles.ts
├── models/
│   ├── Announcement.ts
│   ├── Attendance.ts
│   ├── Employee.ts
│   ├── LeaveRequest.ts
│   ├── Training.ts
│   ├── TrainingEnrollment.ts
│   └── User.ts
└── routes/
    ├── announcementRoutes.ts
    ├── attendanceRoutes.ts
    ├── authRoutes.ts
    ├── dashboardRoutes.ts
    ├── employeeRoutes.ts
    ├── leaveRoutes.ts
    └── trainingRoutes.ts
```

## 3. Request Lifecycle
1. A browser action calls the API wrapper in `src/services/api.ts`.
2. The wrapper sends an HTTP request to an endpoint under `/api` and attaches the Bearer token when present.
3. Express parses JSON and applies route-specific middleware.
4. Authentication middleware validates the token; role middleware restricts selected operations.
5. A route dispatches the request to a controller.
6. The controller validates/uses request data and accesses Mongoose models.
7. Express returns a JSON response; centralized error handling processes errors.

## 4. Major Modules
- **Authentication:** login, current-user lookup, and related token handling.
- **Employees:** directory search/filter, create, update, and activation status.
- **Attendance:** check-in/check-out, duration calculation, and history.
- **Leaves:** submit, list, approve, and reject requests.
- **Announcements:** create, update, archive, and list published content.
- **Training:** create/update programmes, enrolment, and participant views.
- **Dashboard:** summary statistics.
- **Health:** `/api/health`.

## 5. Authentication and Authorization
Passwords are hashed using `bcryptjs`; JSON Web Tokens are issued with a seven-day expiry. Role authorization is implemented by backend middleware for selected endpoints. The three role values are `HR Admin`, `Manager`, and `Employee`.

Security caveat: the reviewed code uses token-based authentication and should use a strong `JWT_SECRET` supplied via environment configuration. Remove any hardcoded fallback. Existing tokens may remain valid until expiry because the authentication middleware does not re-check user activation on each request.

## 6. Error Handling and Operational Notes
A central error handler is mounted after API routes. The health endpoint reports database status. The database module attempts an external MongoDB connection when `MONGODB_URI` is configured and can fall back to an in-memory MongoDB instance. The fallback is non-persistent.

## 7. API Modules
Route files define endpoints for authentication, employees, attendance, leaves, announcements, trainings, and dashboard. Consult the corresponding `server/routes/*Routes.ts` file for exact HTTP methods and paths. Avoid treating a README list as authoritative if it differs from the actual route definitions.

## 8. Known Limitations
No automated test suite was found in the inspected files. Additional validation, rate limiting, restrictive CORS, and security review are recommended. Do not run the seed script against production data; it clears the application collections before reseeding.
