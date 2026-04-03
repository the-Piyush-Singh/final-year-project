import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import DBCon from './libs/db.js';
import AuthRoutes from './routes/Auth.js';
import BlogRoutes from './routes/Blogs.js';
import DashboardRoutes from './routes/Dashboard.js';
import CommentRoutes from './routes/Comments.js';
import UserRoutes from './routes/Users.js';
import FeedRoutes from './routes/Feed.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

// Connect to database
DBCon();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

const corsOptions = {
    origin: true,
    credentials: true
};
app.use(cors(corsOptions));

// Health check
app.get('/', (req, res) => {
    res.json({ success: true, message: 'PostHive API is running' });
});

// Routes
app.use('/auth', AuthRoutes);
app.use('/blog', BlogRoutes);
app.use('/dashboard', DashboardRoutes);
app.use('/comment', CommentRoutes);
app.use('/users', UserRoutes);
app.use('/feed', FeedRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`PostHive API running on port ${PORT}`);
    });
}
