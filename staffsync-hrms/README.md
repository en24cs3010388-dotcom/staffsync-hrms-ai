# StaffSync — Human Resource Management System (HRMS)

StaffSync is a full-stack MERN application built as an academic college project assignment. It delivers a comprehensive Human Resource Management solution featuring role-based authorization, employee lifecycle tracking, attendance logging with work-hour computation, multi-tier leave application workflows, company-wide announcements, and employee training catalogs.

---

## 1. Features & Modules

1. **Authentication & Authorization**:
   - Secure login & logout using JSON Web Tokens (JWT) and `bcryptjs` password hashing.
   - Three distinct organizational roles: **HR Admin**, **Manager**, and **Employee**.
   - Backend-enforced route permissions and access controls (`authorizeRoles` middleware).
   - Instant 1-click Demo Account selectors on the login page for effortless evaluation.

2. **Employee Management**:
   - Add new employees with automatic user login generation.
   - Directory search by name, email, employee code, or designation.
   - Department filtering (Engineering, HR, Marketing, Sales, Finance, Operations) and status filtering (Active / Inactive).
   - Edit employee information and toggle employment status (Active/Inactive).
   - Salary privacy: sensitive compensation data is visible only to HR Admins.

3. **Attendance Management**:
   - Single-click daily Check-In and Check-Out.
   - Automatic shift duration and work hours calculation (rounded to 1 decimal).
   - Status classifications: `Present`, `Half-day` (<4 hours), `Absent`, and `On Leave`.
   - Personal attendance history log.
   - Organization-wide attendance ledger accessible to Managers and HR Admins with date and status filters.

4. **Leave Management**:
   - Leave applications for Casual Leave, Sick Leave, Paid Leave, Unpaid Leave, and Parental Leave.
   - Automatic duration calculation between start and end dates.
   - Employee leave tracking dashboard with status indicators (`Pending`, `Approved`, `Rejected`).
   - Manager & HR Admin review queue with one-click Approval or Rejection and custom reviewer feedback notes.

5. **Announcements**:
   - HR Admins can publish, edit, and archive company-wide announcements.
   - Priority indicators: `High (Urgent)`, `Medium`, and `Low`.
   - Category filtering: `General`, `Policy`, `Event`, `Urgent`, and `Holiday`.
   - Read-only real-time feed for employees and managers.

6. **Training & Skill Development**:
   - HR Admins can create and schedule new professional training programs with seat capacities.
   - Course catalog with capacity progress bars (`enrolled / capacity`).
   - 1-click self-enrollment with capacity constraints and duplicate enrollment prevention.
   - Privileged participant roster view for HR Admins and Managers.

---

## 2. Technology Stack

- **Frontend**: React.js (v19) + Vite + Tailwind CSS
- **Routing**: React Router (v7)
- **Icons**: Lucide React
- **Backend**: Node.js + Express.js (REST API architecture)
- **Database**: MongoDB + Mongoose ODM (with automatic fallback to `mongodb-memory-server` for zero-friction local testing)
- **Authentication**: JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Language**: TypeScript

---

## 3. Project Structure

```text
staffsync-hrms/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components (Navbar, Sidebar, Modal, ProtectedRoute, Layout)
│   │   ├── context/             # AuthContext (JWT session state)
│   │   ├── pages/               # Application pages (Login, Dashboard, Employees, Attendance, Leaves, Announcements, Training)
│   │   ├── services/            # API client service functions
│   │   ├── types/               # Shared TypeScript interfaces
│   │   ├── App.tsx              # Main routing tree
│   │   ├── main.tsx             # DOM mount entry
│   │   └── index.css            # Tailwind & global styles
│   ├── index.html
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                      # Express backend
│   ├── config/
│   │   ├── db.ts                # Database connection & memory fallback
│   │   └── seed.ts              # Database seeder script
│   ├── controllers/             # REST controllers for all 6 modules
│   │   ├── authController.ts
│   │   ├── employeeController.ts
│   │   ├── attendanceController.ts
│   │   ├── leaveController.ts
│   │   ├── announcementController.ts
│   │   ├── trainingController.ts
│   │   └── dashboardController.ts
│   ├── middleware/              # JWT auth, role validation, error handling
│   │   ├── auth.ts
│   │   ├── roles.ts
│   │   └── errorHandler.ts
│   ├── models/                  # Mongoose data models
│   │   ├── User.ts
│   │   ├── Employee.ts
│   │   ├── Attendance.ts
│   │   ├── LeaveRequest.ts
│   │   ├── Announcement.ts
│   │   ├── Training.ts
│   │   └── TrainingEnrollment.ts
│   ├── routes/                  # Express route routers
│   │   ├── authRoutes.ts
│   │   ├── employeeRoutes.ts
│   │   ├── attendanceRoutes.ts
│   │   ├── leaveRoutes.ts
│   │   ├── announcementRoutes.ts
│   │   ├── trainingRoutes.ts
│   │   └── dashboardRoutes.ts
│   └── index.ts                 # Express server bootstrap
├── .env.example                 # Environment variables template
├── .gitignore                   # Excludes node_modules, .env, build output
├── package.json                 # Project dependencies & scripts
└── README.md                    # Project documentation
```

---

## 4. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** (Optional): A local MongoDB instance or MongoDB Atlas URI. If omitted, StaffSync will automatically boot an in-memory MongoDB server so you can test immediately without installing or configuring external databases!

---

## 5. Installation & Setup

1. **Clone or Navigate to the directory**:
   ```bash
   cd staffsync-hrms
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` as needed:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/staffsync
   JWT_SECRET=staffsync_super_secret_jwt_key_2026
   ```

4. **Seed Demo Accounts**:
   ```bash
   npm run seed
   ```

---

## 6. Demo Login Credentials

All demo accounts share the password: **`Password123!`**

| Role | Name | Email | Employee ID | Default Password | Access Permissions |
|---|---|---|---|---|---|
| **HR Admin** | Sarah Jenkins | `admin@staffsync.com` | `ADM001` | `Password123!` | Full control: Add/edit/deactivate employees, approve leaves, create trainings, publish announcements |
| **Manager** | Michael Chang | `manager@staffsync.com` | `MGR001` | `Password123!` | Team oversight: Review leave requests, view all attendance, view training participants |
| **Employee** | Alex Rivera | `employee@staffsync.com` | `EMP001` | `Password123!` | Self-service: Check-in/out, view own history, apply for leave, enroll in training courses |

*(Tip: You can also click the quick buttons on the login screen to autofill credentials instantly!)*

---

## 7. Running the Application

### Option A: Full-stack Development Mode
In the root directory, run:
```bash
npm run dev
```
This runs the full-stack server on `http://localhost:3000` with both Express API routes and the Vite frontend.

### Option B: Separate Backend and Frontend
1. **Start the Express API server**:
   ```bash
   npm run server
   ```
   *(Listens on port 5000)*

2. **In a second terminal, start the Vite client**:
   ```bash
   npm run client
   ```
   *(Opens on port 3000)*

---

## 8. Verification & Test Checklist

- [x] **Backend API Health Check**: `GET /api/health` returns status healthy.
- [x] **Authentication**: Login returns JWT token and sanitized user profile; passwords stored via `bcryptjs` salt rounds.
- [x] **Employee CRUD**: Creating employee adds both Employee and User login credentials; deactivation immediately blocks login.
- [x] **Attendance Check-in/Out**: Computes work hours and prevents duplicate punches on the same day.
- [x] **Leave Requests**: Days duration calculated automatically; managers can approve or reject with comments.
- [x] **Announcements**: HR can publish and archive; non-HR users only see published items.
- [x] **Training**: Capacity limits enforced; duplicate enrollments rejected.
- [x] **Security**: Unauthorized role attempts on `/api/employees` (POST/PUT/PATCH) return `403 Forbidden`.

---

## 9. Known Limitations

- Real-time notifications: Currently handled via standard HTTP polling on page focus rather than WebSockets.
- File uploads: Employee profile photos and training attachments use placeholder avatars; Cloudinary/S3 integration can be added if requested.
