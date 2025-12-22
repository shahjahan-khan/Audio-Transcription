import mongoose from "mongoose";

let connection: typeof mongoose | null = null;

export const connectDB = async () => {
    try {
        if (connection) {
            return connection;
        }

        connection = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transcriptions', {
            maxPoolSize: 10,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log("Connected to MongoDB");
        
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

        return connection;
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}