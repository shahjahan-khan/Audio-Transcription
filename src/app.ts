import dotenv from 'dotenv';
import express from 'express';
import transcriptionRoutes from './routes/transcription.routes';
import { connectDB } from './server';
import { errorHandler, AppError } from './middleware/errorHandler';
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
connectDB().catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', transcriptionRoutes);

// 404 handler
app.use((_req, _res, next) => {
    next(new AppError(404, 'Route not found'));
});

// Global error handler - must be last
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})