import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';

const isAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(403).json({ success: false, message: 'Unauthorized: User not found' });
        }

        if (user.status === 'banned') {
            res.clearCookie('token');
            return res.status(403).json({ success: false, message: 'Your account has been permanently banned from the platform.' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

const isLogin = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ success: false, message: 'Please login to continue' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserModel.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(403).json({ success: false, message: 'User not found' });
        }

        if (user.status === 'banned') {
            res.clearCookie('token');
            return res.status(403).json({ success: false, message: 'Your account has been permanently banned from the platform.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

export { isAdmin, isLogin };