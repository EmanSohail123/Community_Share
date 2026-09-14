import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import listingsRoutes from './routes/listings.js';
import messagesRoutes from './routes/messages.js';
import { configureSocket } from './socket.js';

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' } });
const port = process.env.PORT || 5000;
app.set('io', io);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api', messagesRoutes);

configureSocket(io);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

connectDatabase()
  .then(() => httpServer.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((error) => {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  });
