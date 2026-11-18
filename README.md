# Doctor Tracker

A secure, modern admin portal for managing doctors and their patients with analytics dashboards. Built as two separate applications â€” a Next.js 16 frontend (App Router, TypeScript) and an Express 5 + Mongoose REST API â€” communicating over HTTP with JWT authentication stored in httpOnly cookies.

## Setup Guide

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

### Installation

1. Clone the repository
   ```bash
   git clone <YOUR_REPO_URL> doctor-tracker
   cd doctor-tracker
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

4. Setup environment variables:
   ```bash
   # Server
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, and admin credentials

   # Client
   cd ../client
   cp .env.example .env.local
   # Edit .env.local with your API URL (defaults to http://localhost:5000/api/v1)
   ```

5. Run the seed script (creates the admin + 15+ doctors + 150+ patients over the last 12 months):
   ```bash
   cd server
   npm run seed
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

7. Start the client (new terminal):
   ```bash
   cd client
   npm run dev
   ```

The client runs on `http://localhost:3000` and the API on `http://localhost:5000`.

### Demo Admin Credentials
- Email: `admin@doctortracker.com`
- Password: `Admin@12345`

## System Architecture

```mermaid
flowchart TD
    Browser[Browser<br/>Next.js Client] -->|HTTP + cookies| API[Express REST API<br/>Port 5000]
    API -->|Mongoose| MongoDB[(MongoDB<br/>Doctor/Patient/User collections)]

    subgraph Auth Flow
        Login[POST /auth/login<br/>email + password] -->|validate bcrypt| Issue[Set httpOnly JWT cookie<br/>secure + sameSite per NODE_ENV]
        Issue -->|cookie sent auto| API
        API -->|verify JWT + role| AuthCheck[authMiddleware + authorize('admin')]
    end

    style Browser fill:#f9f,stroke:#333
    style API fill:#bbf,stroke:#333
    style MongoDB fill:#bfb,stroke:#333
```

### Data Flow
- **Read Operations**: Browser → Next.js client → TanStack Query → Axios → Express REST API → Mongoose → MongoDB (with `.lean()`, projection, and indexes)
- **Write Operations**: React Hook Form + Zod → Axios → Express Controller → Service → Mongoose → MongoDB
- **Auth**: `POST /auth/login` validates credentials (bcrypt) and sets an httpOnly JWT cookie. `GET /auth/me` verifies the cookie. `POST /auth/logout` clears it. Cookies are `secure` + `sameSite` correct per `NODE_ENV`.
- **State Management**: TanStack Query caches API responses and invalidates on mutations; optimistic updates avoid full-page reloads.
- **Error Handling**: Centralized Express error middleware → formatted `{ success, message, errors }` responses → Sonner toasts on the client.

## Technical Decisions

### 1. Separate Express API with httpOnly-cookie JWT instead of localStorage
**Decision**: Authentication uses JWTs stored in httpOnly cookies (set by `POST /auth/login`), sent automatically by the browser on every request. The client never touches the token.

**Rationale**:
- **XSS resistance**: httpOnly cookies cannot be read by JavaScript, so an XSS exploit cannot steal the session token (unlike localStorage).
- **CSRF mitigation**: Combined with `sameSite: strict/lax` and `secure` in production, plus `Credentials: true` CORS from a known `CLIENT_URL`.
- **Single source of truth**: Session validity is authoritatively determined by the server (`GET /auth/me`), not by a client-side flag.

### 2. Server-side pagination + MongoDB indexes/aggregations instead of client-side filtering
**Decision**: All list endpoints (`GET /doctors`, `GET /patients`, `/doctors/:id/patients`) accept `page`, `limit`, `search`, `sort`, and filter params. The server applies `.lean()`, field projection, `skip`/`limit`, and text-index search, returning `{ data, meta: { page, limit, total, totalPages } }`. Dashboards use MongoDB aggregation pipelines (`$group`, `$lookup`, `$facet`, `$dateToString`) so only aggregated results cross the wire.

**Rationale**:
- With 150+ patients (and growing), loading all documents into the browser and filtering client-side would destroy performance and memory.
- Indexes on `doctors` (`email`, `specialization`, `hospital`, `createdAt`, text on `name/specialization/hospital`) and `patients` (`doctorId`, `condition`, `createdAt`, text on `name`) keep lookups and sorts in the covered-index range.
- Aggregations compute dashboard stats (patients per doctor, timeline, conditions, specializations) in the database rather than in application memory.### 1. Separation of Client and Server Applications

**Decision**: The project is structured as a monorepo with two completely separate applications: a Next.js frontend and an Express backend, communicating only via REST API.

**Rationale**:
- **Clear Boundaries**: Each application has its own package.json, dependencies, and build process. This prevents dependency conflicts and makes deployment flexible (e.g., deploy client to Vercel, server to Render/Railway).
- **Security**: Server-side authentication and business logic are completely isolated from the frontend. The frontend only knows the API endpoint and doesn't handle sensitive operations.
- **Scalability**: Backend can be scaled independently from the frontend. Multiple frontend instances can point to the same backend API.
- **Technology Fit**: Next.js provides optimal SSR/SSG for the frontend, while Express provides fine-grained control over middleware, routing, and error handling for the backend API.

**Implementation**:
- Root directory contains `client/` and `server/` folders
- Client uses Next.js App Router with React components
- Server uses Express with layered architecture (routes â†’ controllers â†’ services â†’ models)
- Communication is strictly REST over HTTP with httpOnly JWT cookies for auth
- No direct database access from client; all data flows through the API

### 2. TanStack Query for Server State Management

**Decision**: Using TanStack Query (React Query) instead of manual useState + useEffect for all server data fetching.

**Rationale**:
- **Automatic Caching**: Responses are cached by query key, reducing redundant API calls. Cache keys are automatically invalidated when mutations occur.
- **Loading/Error States**: Built-in `isLoading`, `isError`, and `data` states eliminate manual state management boilerplate.
- **Refetching**: Automatic refetching on window focus, reconnection, and polling ensures data stays fresh.
- **Optimistic Updates**: Easy to implement optimistic UI updates that roll back on error.
- **Type Safety**: Full TypeScript support with inferred types from API responses.

**Implementation**:
- Global `QueryProvider` wraps the app with configured `QueryClient`
- Each page uses `useQuery` for GET operations with descriptive keys (e.g., `['doctors', page, search]`)
- Mutations use `useMutation` with `onSuccess` callbacks to invalidate related queries
- Example: When deleting a doctor, `queryClient.invalidateQueries({ queryKey: ['doctors'] })` automatically refetches the list
- Cache is configured with default stale time of 5 minutes for read-heavy data like doctors/patients

## Tech Stack

### Server
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT (httpOnly cookie)
- Zod (validation)
- Helmet, CORS, rate-limiting

### Client
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack React Query
- Recharts
- React Hook Form + Zod

## API Endpoints

### Auth
- POST `/api/v1/auth/login` - Login
- POST `/api/v1/auth/logout` - Logout
- GET `/api/v1/auth/me` - Get current user

### Doctors
- POST `/api/v1/doctors` - Create doctor
- GET `/api/v1/doctors` - List doctors (paginated, filtered)
- GET `/api/v1/doctors/:id` - Get doctor details
- GET `/api/v1/doctors/:id/patients` - Get doctor's patients
- POST `/api/v1/doctors/:id/patients` - Add patient to doctor
- DELETE `/api/v1/doctors/:id/patients/:patientId` - Remove patient
- GET `/api/v1/doctors/filters/options` - Get filter options

### Patients
- GET `/api/v1/patients` - List all patients
- GET `/api/v1/patients/:id` - Get patient details
- PATCH `/api/v1/patients/:id` - Update patient
- DELETE `/api/v1/patients/:id` - Delete patient
- GET `/api/v1/patients/filters/options` - Get filter options

### Dashboard
- GET `/api/v1/dashboard/summary` - Summary stats
- GET `/api/v1/dashboard/patients-per-doctor` - Patients per doctor
- GET `/api/v1/dashboard/timeline` - Timeline data
- GET `/api/v1/dashboard/conditions` - Patients by condition
- GET `/api/v1/dashboard/specializations` - Doctors by specialization

## Screenshots

*(Note: Screenshots should be added here after deployment)*

### Desktop View
- **Dashboard**: Shows summary cards (Total Doctors, Total Patients, New This Month, Avg Patients/Doctor), patient growth timeline chart with range selector, patients per doctor bar chart, conditions pie chart, and specializations bar chart.
- **Doctors Page**: Search input, specialization/hospital filters, paginated table with doctor name (clickable to detail), specialization, hospital, email, patient count, and delete action.
- **Doctor Detail Page**: Doctor info card with photo placeholder, name, specialization, hospital, email, phone, join date. Patients table with name, condition, status, last visit, and remove action.
- **Patients Page**: Search input, condition/doctor filters, paginated table with name, age, gender, condition, doctor name, and edit/delete actions. Edit modal opens for updating patient details.
- **Login Page**: Email/password form with show/hide password toggle, validation errors, and loading state.

### Mobile View (375px)
- Responsive tables with horizontal scroll
- Stacked stat cards on smaller screens
- Touch-friendly buttons and inputs
- Navbar with hamburger menu for navigation

## Database Indexes

### Doctor
- `{ email: 1 }` (unique)
- `{ specialization: 1, createdAt: -1 }`
- `{ hospital: 1, createdAt: -1 }`
- `{ createdAt: -1 }`
- Text index: `{ name: 'text', hospital: 'text', specialization: 'text', email: 'text' }`

### Patient
- `{ doctor: 1, createdAt: -1 }`
- `{ condition: 1, createdAt: -1 }`
- `{ createdAt: -1 }`
- Text index: `{ name: 'text', email: 'text', phone: 'text' }`

## Progress

- [x] Phase 1: Setup (monorepo structure, dependencies, env files)
- [x] Phase 2: Backend core (models, indexes, utils, middlewares, auth routes, seed script)
- [x] Phase 3: Backend features (doctor/patient/dashboard CRUD APIs with aggregation)
- [x] Phase 4: Frontend foundation (Tailwind, API client, providers, layout, login page)
- [x] Phase 5: Frontend features (doctors/patients pages with search, filters, pagination, deletion)
- [x] Phase 6: Polish & optimization (charts, doctor detail, patient edit, responsive tables, loading states)
- [x] Phase 7: Documentation and submission (README with architecture, tech decisions, screenshots)

## Deployment

### Client (Next.js) - Vercel
1. Push code to GitHub
2. Import repository in Vercel
3. Set root directory to `client`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1`
5. Deploy

### Server (Express) - Render/Railway
1. Push code to GitHub
2. Import repository in Render/Railway
3. Set root directory to `server`
4. Add environment variables from `.env.example`
5. Set build command: `npm run build`
6. Set start command: `npm start`
7. Deploy

### MongoDB - Atlas
1. Create free cluster on MongoDB Atlas
2. Whitelist Render/Railway IP addresses
3. Get connection string and update `MONGODB_URI`

### GitHub Repository
*(Repository link to be added after creation)*
- Frontend: https://github.com/your-username/doctor-tracker-frontend
- Backend: https://github.com/your-username/doctor-tracker-backend
- Monorepo: https://github.com/your-username/doctor-tracker

### Deployed Links
*(Deployed URLs to be added after deployment)*
- Frontend: https://doctor-tracker.vercel.app
- Backend: https://doctor-tracker-api.onrender.com

## Tech Stack

| Layer | Technology |
|-------|------------|
| Client | Next.js 16 (App Router), TypeScript, React 19 |
| Styling | Tailwind CSS v4, shadcn/ui (Radix), lucide-react, next/font (Inter) |
| Charts | Recharts |
| Data Fetching | TanStack Query v5 |
| Forms | react-hook-form + zod |
| Notifications | sonner |
| Theming | next-themes |
| Server | Express 5, TypeScript (ESM), Mongoose |
| Auth | JWT (httpOnly cookie), bcryptjs, zod, express-rate-limit, helmet, cors, cookie-parser |
| Database | MongoDB |
| Deployment | PM2 (ecosystem.config.cjs), Nginx, Ubuntu VPS |

## API Endpoint List

### Auth
- `POST   /api/v1/auth/login` — email + password → sets httpOnly JWT cookie (rate-limited)
- `POST   /api/v1/auth/logout` — clears the cookie (auth required)
- `GET    /api/v1/auth/me` — returns current user (auth required)

### Doctors (auth + admin role required)
- `POST   /api/v1/doctors` — create doctor
- `GET    /api/v1/doctors` — list (search, filters, sort, server-side pagination)
- `GET    /api/v1/doctors/filters/options` — distinct specializations & hospitals
- `GET    /api/v1/doctors/:id` — doctor detail (+ patient count)
- `PATCH  /api/v1/doctors/:id` — update doctor
- `DELETE /api/v1/doctors/:id` — delete doctor (cascade deletes patients)
- `GET    /api/v1/doctors/:id/patients` — paginated patients for a doctor
- `POST   /api/v1/doctors/:id/patients` — add patient to a doctor
- `DELETE /api/v1/doctors/:id/patients/:patientId` — remove a patient from a doctor

### Patients (auth + admin role required)
- `GET    /api/v1/patients` — list (search, filters incl. date range/condition/doctor, sort, pagination)
- `GET    /api/v1/patients/filters/options` — distinct conditions & doctors
- `GET    /api/v1/patients/:id` — patient detail
- `PATCH  /api/v1/patients/:id` — update patient
- `DELETE /api/v1/patients/:id` — delete patient

### Dashboard (auth + admin role required)
- `GET /api/v1/dashboard/summary` — total doctors, total patients, today/week/month, avg patients/doctor
- `GET /api/v1/dashboard/patients-per-doctor` — top doctors by patient count
- `GET /api/v1/dashboard/timeline` — patient/doctor growth (7d / 30d / 12m)
- `GET /api/v1/dashboard/conditions` — patients by condition
- `GET /api/v1/dashboard/specializations` — doctors by specialization

### Health
- `GET /api/health` — `{ status: 'ok', timestamp }`

## Screenshots

### Desktop View
- **Dashboard**: Summary cards (Total Doctors, Total Patients, New This Month, Avg Patients/Doctor), patient growth timeline chart with range selector, patients per doctor bar chart, conditions donut chart, specializations bar chart, recent patients table.
- **Doctors Page**: Search, specialization/hospital/date filters, paginated table, Add/Edit/Delete via dialogs, click-through to doctor detail.
- **Doctor Detail Page**: Doctor profile card, patient list, Add Patient dialog, Remove patient confirm.
- **Patients Page**: Search, condition/doctor/date filters, paginated table, Edit/Delete via dialogs, doctor name + condition badge.
- **Login Page**: Split-screen brand panel + form, show/hide password, validation, loading state, error toast.

### Mobile View (375px)
- Slide-in sidebar sheet with hamburger, stacked stat cards, touch-friendly tables, horizontal scroll on data tables.

> *(Note: Screenshots should be added here after deployment — place them in `/docs/screenshots`.)*

## Database Indexes

### Doctor
- `{ email: 1 }` (unique)
- `{ specialization: 1, createdAt: -1 }`
- `{ hospital: 1, createdAt: -1 }`
- `{ createdAt: -1 }`
- Text index: `{ name: 'text', hospital: 'text', specialization: 'text', email: 'text' }`

### Patient
- `{ doctor: 1, createdAt: -1 }`
- `{ condition: 1, createdAt: -1 }`
- `{ createdAt: -1 }`
- Text index: `{ name: 'text', email: 'text', phone: 'text' }`

## Deployment

### Server (Express) — Ubuntu VPS with PM2 + Nginx
See `server/DEPLOY.md` for the full Ubuntu VPS command list, and `server/ecosystem.config.cjs` for PM2 process config (`doctor-tracker-api`, `dist/server.js`). Nginx exaple: server/deploy/nginx.conf.example.

### Client (Next.js) � Vercel
1. Push code to GitHub
2. Import repository in Vercel
3. Set root directory to client
4. Add environment variable: NEXT_PUBLIC_API_URL=https://your-backend-url.com/api/v1
5. Deploy

### MongoDB � Atlas
1. Create a free cluster on MongoDB Atlas
2. Add your VPS IP to Network Access
3. Get the connection string and set MONGODB_URI in server .env

## Progress
- [x] Phase 0: Audit (dev bypass found & removed, no styling root cause identified)
- [x] Phase 1: Real authentication (dev bypass removed, /login built, /auth/login/logout/me working)
- [x] Phase 2: Design system (Tailwind v4 tokens, shadcn/ui components, dark mode, Inter)
- [x] Phase 3: App layout & pages (sidebar, top bar, dashboard, doctors, patients, doctor detail)
- [x] Phase 4: Backend quality & performance (indexes, pagination, validation, error handling)
- [x] Phase 5: Deployment readiness (client/.gitignore, .env.example, builds pass)
- [x] Phase 6: README (this file)


