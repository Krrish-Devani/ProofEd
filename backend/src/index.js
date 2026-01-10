import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { ExpressError } from './lib/ExpressError.js';

import connectDB from './lib/mongodb.js';
import universityRoutes from './routes/university.routes.js';
import adminRoutes from './routes/admin.routes.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use('/api/university', universityRoutes);
app.use('/api/admin', adminRoutes);

app.use((reqq, res, next) => {
  next(new ExpressError(404, 'Route not found'));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).json({ message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
  connectDB();
});