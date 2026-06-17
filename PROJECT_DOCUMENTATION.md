**Project Overview**

- **Name**: Employee Management (monorepo with backend and frontend)
- **Root**: This repository contains two apps: `EM_Backend` (Express + MongoDB) and `EM_Frontend` (React + Vite).

**Quick Summary**

- **Backend**: Node/Express server using Mongoose for MongoDB, JWT auth, routes under `src/routes`, controllers under `src/controllers`, models under `src/models`.
- **Frontend**: Vite + React app, routes and pages in `src/pages`, components under `src/components`, state managed by Redux (store in `src/store`).

**How to run (developer)**

- **Backend**: from `EM_Backend` run:

```bash
cd EM_Backend
npm install
npm run dev   # uses nodemon to run server.js
```

- **Frontend**: from `EM_Frontend` run:

```bash
cd EM_Frontend
npm install
npm run dev   # starts Vite dev server
```

**Backend important scripts**

- **Start**: `npm start` → `node server.js` (see [EM_Backend/package.json](EM_Backend/package.json#L1-L40)).
- **Dev**: `npm run dev` → `nodemon server.js` (see [EM_Backend/package.json](EM_Backend/package.json#L1-L40)).
- **Seed admin**: `npm run seed` → `node scripts/seedAdmin.js` (see [EM_Backend/package.json](EM_Backend/package.json#L1-L40)).

**Frontend important scripts**

- **Dev**: `npm run dev` → `vite` (see [EM_Frontend/package.json](EM_Frontend/package.json#L1-L40)).
- **Build**: `npm run build` → `vite build`.

**Environment variables (backend)**

- `MONGO_URL` : MongoDB connection string. (Used in [EM_Backend/server.js](EM_Backend/server.js#L1-L80)).
- `PORT` : optional server port (defaults to 5000). See [EM_Backend/server.js](EM_Backend/server.js#L60-L70).
- `FRONTEND_URL` : allowed CORS origin (optional).

**High-level architecture & key files**

- **Backend entry**: [EM_Backend/server.js](EM_Backend/server.js#L1-L200) — connects to MongoDB, sets up CORS, JSON parsing, mounts routes at `/api`, and exposes Swagger UI if `src/docs/openapi.json` exists.
- **Routes index**: [EM_Backend/src/routes/Routes.js](EM_Backend/src/routes/Routes.js#L1) — mounts modular routes (auth, user, timeEntry).
- **Auth**: controllers in [EM_Backend/src/controllers/auth.controller.js](EM_Backend/src/controllers/auth.controller.js#L1) and route in [EM_Backend/src/routes/auth.route.js](EM_Backend/src/routes/auth.route.js#L1).
- **User**: model in [EM_Backend/src/models/user.js](EM_Backend/src/models/user.js#L1), controller [EM_Backend/src/controllers/user.controller.js](EM_Backend/src/controllers/user.controller.js#L1), routes [EM_Backend/src/routes/user.route.js](EM_Backend/src/routes/user.route.js#L1).
- **Time tracking**: model in [EM_Backend/src/models/timeEntry.model.js](EM_Backend/src/models/timeEntry.model.js#L1) and controllers/routes under `timeEntry.*`.
- **Middleware**: auth checks in [EM_Backend/src/middleware/authMiddleware.js](EM_Backend/src/middleware/authMiddleware.js#L1).
- **Utilities**: helpers in [EM_Backend/src/utils](EM_Backend/src/utils/paginatedQuery.js#L1) and [EM_Backend/src/utils/utils.js](EM_Backend/src/utils/utils.js#L1).
- **API docs**: OpenAPI JSON located at [EM_Backend/src/docs/openapi.json](EM_Backend/src/docs/openapi.json#L1) — server attempts to load it and mount Swagger at `/api/docs`.

**Project Flow**

- **User action (UI)**: User interacts with a frontend page (examples: login, add employee, new time entry) under [EM_Frontend/src/pages](EM_Frontend/src/pages).
- **Client request**: The frontend dispatches a Redux action or sends an HTTP request (fetch/axios) to a backend API endpoint (routes mounted under `/api`).
- **Routing & Auth**: Express routes (see [EM_Backend/src/routes](EM_Backend/src/routes)) receive requests. Protected routes pass through `authMiddleware` in [EM_Backend/src/middleware/authMiddleware.js](EM_Backend/src/middleware/authMiddleware.js#L1) which validates JWTs or session tokens.
- **Controller**: The matched controller (e.g., [EM_Backend/src/controllers/auth.controller.js](EM_Backend/src/controllers/auth.controller.js#L1), [EM_Backend/src/controllers/user.controller.js](EM_Backend/src/controllers/user.controller.js#L1), [EM_Backend/src/controllers/timeEntry.controller.js](EM_Backend/src/controllers/timeEntry.controller.js#L1)) validates input, performs business logic, and calls model functions.
- **Model & DB**: Mongoose models in [EM_Backend/src/models](EM_Backend/src/models) read/write documents to MongoDB using the `MONGO_URL` connection configured in [EM_Backend/server.js](EM_Backend/server.js#L1-L40).
- **Response & UI update**: Controllers send JSON responses; frontend reducers update state in [EM_Frontend/src/store](EM_Frontend/src/store) and UI components re-render.
- **File uploads**: Frontend upload endpoints send multipart/form-data to backend endpoints which save files in the `uploads/` folder and persist file paths in user documents.
- **Dev & seed flow**: Developers run `npm run dev` for backend and frontend. Use `npm run seed` (in `EM_Backend`) to create an initial admin user via [EM_Backend/scripts/seedAdmin.js](EM_Backend/scripts/seedAdmin.js#L1).
- **Deployment flow (summary)**: Build frontend (`EM_Frontend: npm run build`) and host static assets (CDN or static host). Run backend with environment variables set (`MONGO_URL`, `PORT`, `FRONTEND_URL`) and use a process manager (PM2, systemd) or containerization for production.

**Module → Role mapping (who uses what)**

- **Roles defined**: `admin`, `employee` (see [EM_Frontend/src/constant/roles.js](EM_Frontend/src/constant/roles.js#L1-L20) and `role` enum in [EM_Backend/src/models/user.js](EM_Backend/src/models/user.js#L1-L40)).

- **Frontend modules/pages and expected role**
  - `Login` (`EM_Frontend/src/pages/Login.jsx`): public — used by both `admin` and `employee` to authenticate.
  - `Dashboard` (`EM_Frontend/src/pages/Dashboard.jsx`): protected — visible to both roles; may show different widgets based on role.
  - `Employees` (`EM_Frontend/src/pages/Employee/Employees.jsx`): admin — list, add, edit, deactivate employees via backend user routes.
  - `AddEmployee` / `EditEmployee` (`EM_Frontend/src/pages/Employee/AddEmployee/*`, `EditEmployee/*`): admin — create and manage employee records.
  - `Profile` (`EM_Frontend/src/pages/Profile.jsx`): protected — user can view/edit their own profile (both roles).
  - `TimeTracking` / `NewEntry` (`EM_Frontend/src/pages/TimeTracking/*`): employee — submit time entries; admin can review.
  - `Unauthorized` (`EM_Frontend/src/pages/Unauthorized/Unauthorized.jsx`): shown when role lacks access.

- **Backend modules and role access**
  - `Auth` (`EM_Backend/src/routes/auth.route.js`, `auth.controller.js`): public endpoints `POST /api/auth/login`, `POST /api/auth/logout` used by both roles.
  - `User` (`EM_Backend/src/routes/user.route.js`, `user.controller.js`): all routes protected by `protect` middleware. Typical usage:
    - `POST /api/users/add` — protected; used by admin (frontend sends requests from admin UI) to add employees. Controller sets `role: employee` for new users.
    - `GET /api/users` — protected; used by admin to list employees.
    - `GET /api/users/:id`, `PUT /api/users/:id`, `DELETE /api/users/:id` — protected; admin/manage own profile (PUT on own id) or admin managing employees.
  - `TimeEntry` (`EM_Backend/src/routes/timeEntry.route.js`, `timeEntry.controller.js`): role-aware routes via `authorize(...)`:
    - Employee-only: `POST /api/time-entries/` (create), `GET /api/time-entries/my` (view own entries).
    - Admin-only: `GET /api/time-entries/` (view all), `PUT /api/time-entries/:id/approve`, `PUT /api/time-entries/:id/reject` (approve/reject entries).
  - `Middleware` (`EM_Backend/src/middleware/authMiddleware.js`): `protect` verifies JWT and attaches `req.user` (including `role`) to requests; `DecodeJwtToken` decodes token when needed.

- **Typical interactions by role**
  - Admin:
    - Logs in → receives JWT with `role: admin`.
    - Manages employees via user endpoints (`add`, `list`, `update`, `deactivate`).
    - Reviews and approves/rejects time entries via admin time-entry endpoints.

  - Employee:
    - Logs in → receives JWT with `role: employee`.
    - Submits time entries and views personal timesheet and stats via `/api/time-entries/my`.
    - Views and updates own profile via user endpoints (protected; only allowed on their own id by UI logic).

If you want, I can also annotate each endpoint in `PROJECT_DOCUMENTATION.md` with the exact HTTP path and the controller file reference. Which format do you prefer — table-like API map or inline bullets?

**Frontend structure & key files**

- **Entry**: [EM_Frontend/src/main.jsx](EM_Frontend/src/main.jsx#L1) — app bootstrap.
- **Routing**: [EM_Frontend/src/routes/index.js](EM_Frontend/src/routes/index.js#L1) — defines client routes.
- **Pages**: [EM_Frontend/src/pages](EM_Frontend/src/pages) — `Dashboard`, `Login`, `Profile`, `Employees`, `TimeTracking`, etc.
- **Components**: [EM_Frontend/src/components](EM_Frontend/src/components) — UI primitives and custom inputs.
- **State**: Redux store at [EM_Frontend/src/store/store.js](EM_Frontend/src/store/store.js#L1) and actions/reducers in `Action/` and `Reducer/`.
- **Constants**: roles and other constants in [EM_Frontend/src/constant](EM_Frontend/src/constant/roles.js#L1).

**Notable developer utilities**

- `EM_Backend/scripts/seedAdmin.js` — creates an initial admin user (run `npm run seed`).
- File uploads: backend has an `uploads/` directory; server previously had middleware to serve uploads but it is commented out in [EM_Backend/server.js](EM_Backend/server.js#L1-L40).

**Suggested API endpoints (where to look)**

- Authentication endpoints: check [EM_Backend/src/routes/auth.route.js](EM_Backend/src/routes/auth.route.js#L1) and [EM_Backend/src/controllers/auth.controller.js](EM_Backend/src/controllers/auth.controller.js#L1).
- User CRUD and profile: check [EM_Backend/src/routes/user.route.js](EM_Backend/src/routes/user.route.js#L1) and [EM_Backend/src/controllers/user.controller.js](EM_Backend/src/controllers/user.controller.js#L1).
- Time entries: check [EM_Backend/src/routes/timeEntry.route.js](EM_Backend/src/routes/timeEntry.route.js#L1) and [EM_Backend/src/controllers/timeEntry.controller.js](EM_Backend/src/controllers/timeEntry.controller.js#L1).

**Quick debugging tips**

- Confirm `MONGO_URL` is set and reachable.
- Start backend with `npm run dev` and check console for `MongoDB Connected` and `Server running on port` logs in [EM_Backend/server.js](EM_Backend/server.js#L20-L80).
- If Swagger UI doesn't appear, ensure `src/docs/openapi.json` exists and is valid JSON.

**ChatGPT prompt template**
Use the following when sending project context to another ChatGPT instance. Paste the whole repository summary followed by the file links and ask a specific task.

---

Context:

- Project: Employee Management (Express + MongoDB backend, React + Vite frontend).
- Repo layout: backend in `EM_Backend/`, frontend in `EM_Frontend/`.
- Backend entry: [EM_Backend/server.js](EM_Backend/server.js#L1-L200).
- Frontend entry: [EM_Frontend/src/main.jsx](EM_Frontend/src/main.jsx#L1).

Task:

- Please analyze the project and do one of the following (pick one):
  - Generate a high-level tech spec and API map listing endpoints, expected request/response schemas, auth requirements, and file locations for each endpoint.
  - Create a prioritized TODO list for remaining features, bugs, and improvements with code pointers.
  - Produce a step-by-step migration guide to deploy this app (backend + frontend) to a single VPS or to Heroku/Render.

Context note:

- The backend expects `MONGO_URL` for DB and optionally `PORT` and `FRONTEND_URL` for CORS.
- The backend includes `scripts/seedAdmin.js` to create an initial admin user.

Example prompt to paste into ChatGPT:
"I have an Employee Management repo with the following structure: backend in EM_Backend (Express, Mongoose), frontend in EM_Frontend (React, Vite). Key entry points: [EM_Backend/server.js](EM_Backend/server.js#L1-L200), [EM_Frontend/src/main.jsx](EM_Frontend/src/main.jsx#L1). Please produce a detailed API map (endpoints, HTTP methods, request/response schemas), auth rules, and where each route is implemented in the codebase. If anything is unclear, list questions to inspect specific files."

---

If you'd like, I can also:

- extract the OpenAPI JSON into a readable summary,
- create a concise README.md in each subfolder with run steps,
- or open specific files and annotate endpoints inline.
