import express from 'express';
import { Login, Logout, Register, getMe, updateProfile } from '../controllers/Auth.js';
import { upload } from '../middleware/Multer.js';
import { isLogin } from '../middleware/CheckAdmin.js';

const AuthRoutes = express.Router();

AuthRoutes.post('/register', upload.single('profile'), Register);
AuthRoutes.post('/login', Login);
AuthRoutes.post('/logout', Logout);
AuthRoutes.get('/me', isLogin, getMe);
AuthRoutes.patch('/profile/:id', upload.single('profile'), isLogin, updateProfile);

export default AuthRoutes;