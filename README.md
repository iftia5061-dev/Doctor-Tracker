# Doctor Tracker

A secure admin web application to manage doctors and their patients with analytics dashboard. Built as a monorepo with separate Next.js frontend and Express backend applications communicating via REST API with JWT authentication and MongoDB data persistence.

## Setup Guide

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
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
   # Edit .env with your MongoDB URI and JWT secret

   # Client
   cd ../client
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

5. Run seed script:
   ```bash
   cd server
   npm run seed
   ```

6. Start server:
   ```bash
   npm run dev
   ```

7. Start client (new terminal):
   ```bash
   cd client
   npm run dev
   ```

### Demo Admin Credentials
- Email: admin@doctortracker.com
- Password: Admin@12345

## System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Browser   │ ──────▶ │  Next.js     │ ──────▶ │   Express   │
│             │ HTTP    │  Client      │ REST    │   Server    │
│  (Client)   │         │  (Frontend)  │ API     │  (Backend)  │
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                      │
                                                      ▼
                                              ┌─────────────┐
                                              │  MongoDB    │
                                              │  Database   │
                                              └─────────────┘

Authentication Flow:
1. User enters credentials on /login
2. Client POSTs to /api/v1/auth/login
3. Server validates and sets httpOnly JWT cookie
4. Client stores auth state in AuthProvider
5. Subsequent requests include cookie automatically
6. Middleware validates JWT on protected routes
```

### Data Flow
- **Read Operations**: Next.js → TanStack Query → Axios → Express → Mongoose → MongoDB
- **Write Operations**: React Hook Form → Zod Validation → Axios → Express → Controller → Service → Mongoose → MongoDB
- **State Management**: TanStack Query caches API responses, invalidates on mutations
- **Error Handling**: Central error middleware → formatted API response → toast notification

### Folder Structure
- **Routes**: API endpoint definitions
- **Controllers**: Request/response handling
- **Services**: Business logic + database queries
- **Models**: Mongoose schemas + indexes
- **Middlewares**: Auth, validation, error handling
- **Validators**: Zod schemas for input validation

## Technical Decisions

### 1. Separation of Client and Server Applications

**Decision**: The project is structured as a monorepo with two completely separate applications: a Next.js frontend and an Express backend, communicating only via REST API.

**Rationale**:
- **Clear Boundaries**: Each application has its own package.json, dependencies, and build process. This prevents dependency conflicts and makes deployment flexible (e.g., deploy client to Vercel, server to Render/Railway).
- **Security**: Server-side authentication and business logic are completely isolated from the frontend. The frontend only knows the API endpoint and doesn't handle sensitive operations.
- **Scalability**: Backend can be scaled independently from the frontend. Multiple frontend instances can point to the same backend API.
- **Technology Fit**: Next.js provides optimal SSR/SSG for the frontend, while Express provides fine-grained control over middleware, routing, and error handling for the backend API.

**Implementation**:
- Root directory contains `client/` and `server/` folders
- Client uses Next.js App Router with React components
- Server uses Express with layered architecture (routes → controllers → services → models)
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
