# StaffSync — Modern Human Resource Management System

StaffSync is a web-based Human Resource Management System (HRMS) built with React, TypeScript, Express, MongoDB, and Mongoose. It provides role-based access for HR Admins, Managers, and Employees.

## Documentation
- [Project report](docs/PROJECT_REPORT.md)
- [Setup and execution guide](docs/SETUP_GUIDE.md)
- [Backend documentation](docs/BACKEND_DOCUMENTATION.md)
- [Database documentation](docs/DATABASE_DOCUMENTATION.md)
- [Frontend documentation](docs/FRONTEND_DOCUMENTATION.md)
- [Task-to-deliverable checklist](docs/TASK_CHECKLIST.md)
- [Screenshots checklist](docs/SCREENSHOTS_AND_DEMO.md)

## Diagrams
Open SVGs in a browser or embed them in a report:
- `docs/diagrams/system-architecture.svg`
- `docs/diagrams/technical-architecture.svg`
- `docs/diagrams/er-diagram.svg`
- `docs/diagrams/mvc-pattern.svg`
- `docs/diagrams/backend-structure.svg`
- `docs/diagrams/user-flow.svg`

## Security
Do not commit `.env` files, database connection strings, JWT secrets, API keys, or passwords. Use environment variables configured in the runtime environment. The example environment file must contain placeholders only.

## Important implementation notes
This documentation describes the root application layout. The project also contains a nested `staffsync-hrms/` copy; the root layout is documented as the primary path because its `npm run dev` script runs `tsx server.ts`. Verify and clean up duplicate layouts before making structural changes.
