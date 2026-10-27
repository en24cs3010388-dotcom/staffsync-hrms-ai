# Frontend Development Documentation

## 1. Overview
The frontend uses React 19 and TypeScript, with React Router for navigation, Vite for development tooling, Tailwind CSS for styling, and lucide-react for icons.

## 2. Main Structure
```text
src/
├── main.tsx
├── App.tsx
├── components/
├── context/
│   └── AuthContext.tsx
├── pages/
│   ├── AnnouncementsPage.tsx
│   ├── AttendancePage.tsx
│   ├── DashboardPage.tsx
│   ├── EmployeesPage.tsx
│   ├── LeavePage.tsx
│   ├── LoginPage.tsx
│   └── TrainingPage.tsx
├── services/
│   └── api.ts
└── types/
    └── index.ts
```

## 3. Application Entry and Navigation
`src/main.tsx` mounts the React application. `src/App.tsx` defines the route tree and page navigation. Page components represent the major user-facing modules.

## 4. Authentication State
`src/context/AuthContext.tsx` stores authentication state and uses the browser's `localStorage` key `staffsync_token` for the token. The API service adds a Bearer token to requests when available. Because the token is stored in localStorage, protect the app from cross-site scripting and consider stronger session patterns for production.

## 5. API Integration
`src/services/api.ts` provides a shared fetch wrapper using `/api` as the API base. The backend returns JSON data. Page components request data when mounted and when relevant filters change.

## 6. Main Pages
- **Login:** allows a user to sign in.
- **Dashboard:** presents summary information.
- **Employees:** employee directory and HR operations.
- **Attendance:** check-in/out and attendance history.
- **Leave:** submit leave and review requests where authorized.
- **Announcements:** read published announcements and manage them where authorized.
- **Training:** view programmes and enrol; authorized roles can manage programmes/participants.

## 7. UI Role Handling
The UI conditionally renders controls based on role. This improves usability, but the backend must remain the authority for access control. Route-level frontend role gating should not be assumed unless explicitly configured in the route tree.

## 8. Limitations
No automated frontend test suite was found in the inspected files. Add component tests and end-to-end tests as future improvements. Capture screenshots from the running application only.
