# Database Development Documentation

## 1. Database Technology
StaffSync uses MongoDB with Mongoose. The application can connect to an external MongoDB instance using `MONGODB_URI`; the code also supports an in-memory MongoDB fallback for development.

## 2. Connection Process
1. Load environment variables.
2. Read `MONGODB_URI`.
3. Sanitize the URI to handle special characters in credentials.
4. Attempt to connect with Mongoose.
5. Update the reported database status.
6. If external connection fails, the implementation may use an in-memory fallback.
7. The server checks whether users exist and may seed initial data when the collection is empty.

Never include the actual URI or credentials in a report, screenshot, repository, or demo video.

## 3. Models
| Model | Purpose | References |
|---|---|---|
| `User` | Login identity, password hash, role and account data | No ObjectId references identified |
| `Employee` | HR employee profile | Optional `user` → `User` |
| `Attendance` | User attendance/check-in/out data | `user` → `User` |
| `LeaveRequest` | Leave request and review status | `user` → `User`; `reviewedBy` → `User` |
| `Announcement` | Announcement content and publication status | `author` → `User` |
| `Training` | Training programme details and capacity | `createdBy` → `User` |
| `TrainingEnrollment` | User enrolment in a programme | `training` → `Training`; `user` → `User` |

## 4. Relationships
- One `User` may have an associated `Employee` profile.
- A `User` can have many attendance records.
- A `User` can submit many leave requests; a user may also review leave requests.
- A user authors announcements and creates training programmes.
- `TrainingEnrollment` acts as a junction model connecting users and training programmes, allowing many-to-many enrolment.

The ER-style SVG represents document references conceptually. MongoDB is document-oriented; this is not a relational SQL schema.

## 5. Data Integrity
The source defines uniqueness constraints for relevant email/employee-code fields and for attendance `(user, date)` and training enrolment `(training, user)`. Some names and employee codes are denormalized into records for display/query purposes. Date values in attendance, leave, and training workflows include `YYYY-MM-DD` strings.

## 6. Seed Script Warning
The seed script deletes documents from all seven collections before inserting demo data. Use only a disposable development database when running it. Never execute it on a database containing important or production records.

## 7. Configuration Checklist
- Set `MONGODB_URI` in the local `.env` or deployment secret settings.
- Set a strong `JWT_SECRET` separately.
- Verify the database network access and user permissions.
- Check `/api/health` and server logs.
- Ensure `.env` is not tracked by Git and `.env.example` contains placeholders only.
