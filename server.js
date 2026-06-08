import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Database & Route Imports
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Dotenv (loading from root .env)
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config(); // fallback local

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for frontend dev servers and deployed Vercel frontend
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://job-poratal-4wlf.vercel.app'
  ],
  credentials: true
}));

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists and serve it statically
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Connect to Database (with automatic local file fallback)
connectDB();

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/user', userRoutes);
app.use('/api', applicationRoutes); // Exposes: /api/apply and /api/applicants/:jobId

// Root path fallback
app.get('/', (req, res) => {
  res.send('⚡ HireWave API Service is Online and Operational.');
});

// Custom Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`💥 Error: ${err.message}`);
  
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Boot up server
app.listen(PORT, () => {
  console.log(`🚀 HireWave server roaring on port http://localhost:${PORT}`);
});
