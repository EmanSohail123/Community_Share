# CommunityShare

A MERN app for sharing tools, skills, and services with nearby neighbors. It includes authentication, listings with Cloudinary images and coordinates, Socket.io chat, Leaflet maps, ratings/reviews, and admin moderation.

## Setup

1. Install Node.js 18+ and create a MongoDB Atlas database.
2. Copy `server/.env.example` to `server/.env` and `client/.env.example` to `client/.env`. Fill in MongoDB, JWT, Cloudinary, and deployment URLs.
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

## Environment variables

Server: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

Client: `VITE_API_URL` must include the `/api` suffix, and `VITE_SOCKET_URL` must point to the server origin without `/api`.

## Module 4

- `POST /api/reviews` requires an existing two-person conversation and prevents duplicate reviews for the same reviewer/reviewee/listing exchange.
- `GET /api/reviews/user/:userId` returns reviews, average rating, and review count.
- Admin routes are under `/api/admin` and require a user with `isAdmin: true`.
- The admin UI is available at `/admin`. Bootstrap the first admin by updating a trusted user in MongoDB:

```js
db.users.updateOne({ email: "admin@example.com" }, { $set: { isAdmin: true } })
```

Import `postman/CommunityShare-Module4.postman_collection.json` for example requests. Set its `token`, `userId`, `revieweeId`, `conversationId`, and `listingId` variables after login and creating test data.

## Deployment

- Set `CLIENT_URL` to the deployed frontend origin and configure the hosting provider to expose the server port.
- Set `VITE_API_URL` to the deployed API URL ending in `/api`; set `VITE_SOCKET_URL` to the deployed API origin.
- Deploy the client with `npm run build` and serve `client/dist` through a static host.
- Deploy the server with `npm start`; use a managed MongoDB instance and production Cloudinary credentials.
- Configure the production host and proxy to allow WebSocket upgrades for Socket.io.
- Never commit `.env` files or real secrets.
