# AI Career Platform — Milestone 1

Production-grade AI-powered Developer Career Platform.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, Vite, Tailwind CSS, React Router, Redux Toolkit, TanStack Query, Axios, React Hook Form |
| Backend | Node.js, Express, MongoDB, Mongoose |
| DevOps | Docker, GitHub Actions, ESLint, Prettier |

## Project Structure

```
├── client/          # React frontend
├── server/          # Express backend (MVC)
├── docker-compose.yml
└── .github/workflows/
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB Atlas account (or local MongoDB via Docker)

## Installation

### 1. Clone and install dependencies

```bash
# Backend
cd server
cp .env.example .env
npm install

# Frontend
cd ../client
cp .env.example .env
npm install
```

### 2. Configure environment variables

Edit `server/.env` with your MongoDB URI and secrets.

Edit `client/.env` with the API base URL (default: `http://localhost:5000/api/v1`).

### 3. Run with Docker (optional)

```bash
docker-compose up --build
```

### 4. Run locally

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- Health check: http://localhost:5000/api/v1/health

# AI Career Platform — Milestone 2

Production-grade AI-powered Developer Career Platform with full authentication.

## API Endpoints (Milestone 2 — Auth)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register (student/recruiter) |
| POST | `/api/v1/auth/login` | No | Login + receive access token |
| POST | `/api/v1/auth/refresh-token` | Cookie | Refresh access token |
| POST | `/api/v1/auth/logout` | Optional | Logout current session |
| POST | `/api/v1/auth/logout-all` | Yes | Logout all devices |
| GET | `/api/v1/auth/verify-email/:token` | No | Verify email |
| POST | `/api/v1/auth/resend-verification` | Yes | Resend verification email |
| POST | `/api/v1/auth/forgot-password` | No | Request password reset |
| POST | `/api/v1/auth/reset-password/:token` | No | Reset password |
| GET | `/api/v1/auth/me` | Yes | Get current user |
| PATCH | `/api/v1/auth/profile` | Yes | Update profile |
| PATCH | `/api/v1/auth/change-password` | Yes | Change password |
| POST | `/api/v1/auth/profile/avatar` | Yes | Upload profile picture |

## API Endpoints (Profile Module)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/profile/me` | Yes | Get full profile (user + career data) |
| PATCH | `/api/v1/profile/personal` | Yes | Update personal details & links |
| PUT | `/api/v1/profile/skills` | Yes | Replace skills array |
| POST | `/api/v1/profile/education` | Yes | Add education entry |
| PATCH | `/api/v1/profile/education/:id` | Yes | Update education entry |
| DELETE | `/api/v1/profile/education/:id` | Yes | Delete education entry |
| POST | `/api/v1/profile/experience` | Yes | Add experience entry |
| PATCH | `/api/v1/profile/experience/:id` | Yes | Update experience entry |
| DELETE | `/api/v1/profile/experience/:id` | Yes | Delete experience entry |
| POST | `/api/v1/profile/projects` | Yes | Add project |
| PATCH | `/api/v1/profile/projects/:id` | Yes | Update project |
| DELETE | `/api/v1/profile/projects/:id` | Yes | Delete project |
| POST | `/api/v1/profile/certifications` | Yes | Add certification |
| PATCH | `/api/v1/profile/certifications/:id` | Yes | Update certification |
| DELETE | `/api/v1/profile/certifications/:id` | Yes | Delete certification |

### Seed admin user

```bash
cd server
npm run seed:admin
# Default: admin@aicareerplatform.com / Admin@12345
```

## API Endpoints (Milestone 1)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/health` | Server & database health status |

## Scripts

### Server

```bash
npm run dev      # Development with nodemon
npm start        # Production
npm run lint     # ESLint
npm run format   # Prettier
npm run seed:admin  # Create default admin user
```

### Client

```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
npm run format   # Prettier
```

## Architecture

- **MVC** on the backend: Routes → Controllers → Services → Models
- **Feature-based** frontend with reusable components, hooks, and utilities
- **API versioning** via `/api/v1`
- **Security**: Helmet, CORS, rate limiting
- **Dark/Light mode** with system preference support
