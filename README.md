# 🎬 GenZShow — Movie Discovery & Ticket Booking

Discover movies, find theatres and showtimes, choose seats, and manage bookings in one full stack web app.

## 📁 Project Structure

```text
Genzshow/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── components/     # Shared UI and admin components
│       ├── context/        # App state, API client, and auth integration
│       ├── pages/          # Movies, theatres, bookings, and admin pages
│       └── assets/         # Images, icons, and other static assets
│
├── server/                 # Node.js + Express API
│   ├── configs/            # MongoDB and email setup
│   ├── controllers/        # API request handlers
│   ├── middleware/         # Clerk admin authorization
│   ├── models/             # Mongoose data models
│   ├── routes/             # API routes
│   ├── services/           # AI recommendation services
│   └── scripts/            # Data import utilities
│
└── data/
    └── theatres.csv        # Theatre data for the optional import script
```

## ⚡ Quick Start (Local Development)

Install [Node.js](https://nodejs.org/) 18 or newer. Configure the environment files before starting the app. See [Environment Variables](#-environment-variables).

### 1. Backend

In a VS Code terminal:

```powershell
cd server
npm install
npm run server
```

The API runs at `http://localhost:3000`. MongoDB must be reachable or the server will stop during startup.

### 2. Frontend

Open a second VS Code terminal:

```powershell
cd client
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`.

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/show/now-playing` | Get now-playing movies from TMDB |
| GET | `/api/show` | List shows |
| GET | `/api/show/:movieId` | Get show information for a movie |
| POST | `/api/show/add` | Add a show |
| GET | `/api/theatre` | List theatres |
| GET | `/api/theatre/:id` | Get theatre details |
| GET | `/api/theatre/:id/shows` | Get shows at a theatre |
| POST | `/api/booking/create` | Create a booking and Stripe checkout session |
| GET | `/api/booking/seats/:showId` | Get occupied seats for a show |
| GET | `/api/user/bookings` | Get the signed-in user's bookings |
| GET | `/api/user/favorites` | Get the signed-in user's favorites |
| POST | `/api/user/update-favorite` | Update the signed-in user's favorites |
| GET | `/api/movie-dna/` | Read the user's Movie DNA profile |
| POST | `/api/movie-dna/update` | Update the user's Movie DNA profile |
| POST | `/api/recommendation/ai` | Request AI movie recommendations |
| GET | `/api/admin/is-admin` | Check the signed-in user's admin role |
| GET | `/api/admin/dashboard` | Get admin dashboard data; admin role required |

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Routing | React Router DOM 7 |
| UI | Lucide React, React Hot Toast, React Player |
| HTTP client | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB + Mongoose |
| Authentication | Clerk |
| Payments | Stripe |
| AI | Google Gemini |
| Background jobs | Inngest |

## 📦 Features

- Movie discovery, showtimes, and theatre listings
- Seat selection and ticket bookings
- Favorites and booking history
- Admin dashboard for shows and bookings
- AI movie recommendations and Movie DNA profiles
- Clerk sign-in and role-protected admin actions
- Stripe checkout and booking email integrations
- Responsive React interface

## 🔧 Environment Variables

Create `client/.env` and `server/.env` locally. The project `.gitignore` excludes these files; never commit credentials.

### `client/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BASE_URL=http://localhost:3000
VITE_CURRENCY=
VITE_TMDB_IMAGE_BASE_URL=
```

### `server/.env`

```env
PORT=3000
MONGODB_URI=
CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
TMDB_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
SENDER_EMAIL=
SMTP_USER=
SMTP_PASS=
```

Use credentials from the relevant services. MongoDB and Clerk are needed for core local use; TMDB, Gemini, Stripe, Inngest, and email credentials enable their related features.

## 🛡️ Admin Access

The backend checks the signed-in Clerk user's **Private metadata** for this role:

```json
{"role":"admin"}
```

Add it to the intended user in the Clerk Dashboard, then refresh the app. The frontend alone does not grant admin access.

## 🧰 Available Scripts

| Folder | Command | Description |
|---|---|---|
| `client` | `npm run dev` | Start Vite development server |
| `client` | `npm run build` | Build the frontend for production |
| `client` | `npm run lint` | Run ESLint |
| `client` | `npm run preview` | Preview the production build locally |
| `server` | `npm run server` | Start the API with Nodemon |
| `server` | `npm start` | Start the API with Node.js |
