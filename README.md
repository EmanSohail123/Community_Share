# CommunityShare

A MERN starter for sharing tools, skills, and services with nearby neighbors.

## Setup

1. Install Node.js 18+ and create a MongoDB Atlas database.
2. Copy `server/.env.example` to `server/.env` and fill in `MONGO_URI` and a long `JWT_SECRET`.
3. Start the API:

```powershell
cd server
npm.cmd run dev
```

4. In another terminal, start the React app:

```powershell
cd client
npm.cmd run dev
```

Open http://localhost:5173.

## Structure

- `server/src/index.js`: Express app, middleware, routes, and startup.
- `server/src/config/db.js`: Mongoose Atlas connection.
- `server/src/models/User.js`: User schema with timestamps and hidden password reads.
- `server/src/routes/auth.js`: Registration, login, and current-user endpoints.
- `server/src/middleware/protect.js`: Bearer JWT route protection.
- `client/src/context/AuthContext.jsx`: Session state and localStorage persistence.
- `client/src/components/ProtectedRoute.jsx`: Redirects signed-out users to login.
- `client/src/App.jsx`: Landing, auth, and dashboard views.

## API

- `POST /api/auth/register` with `{ "name", "email", "password" }`
- `POST /api/auth/login` with `{ "email", "password" }`
- `GET /api/auth/me` with `Authorization: Bearer <token>`
- `GET /api/health`

Set `VITE_API_URL` in `client/.env` if the API is hosted somewhere other than `http://localhost:5000/api`.
