import express from 'express';
import { Create, DeleteBlog, GetPosts, GetSinglePost, GetUserPosts, GetMyPosts, LikeToggle, update, SavePostToggle } from '../controllers/Blog.js';
import { upload } from '../middleware/Multer.js';
import { isLogin } from '../middleware/CheckAdmin.js';

const BlogRoutes = express.Router();

// Public routes
BlogRoutes.get('/GetPosts', GetPosts);
BlogRoutes.get('/post/:id', GetSinglePost);
BlogRoutes.get('/user/:userId', GetUserPosts);

// Protected routes (any logged-in user)
BlogRoutes.post('/create', isLogin, upload.single('postimg'), Create);
BlogRoutes.patch('/update/:id', isLogin, upload.single('postimg'), update);
BlogRoutes.delete('/delete/:id', isLogin, DeleteBlog);
BlogRoutes.post('/like/:id', isLogin, LikeToggle);
BlogRoutes.post('/save/:id', isLogin, SavePostToggle);
BlogRoutes.get('/myposts', isLogin, GetMyPosts);

export default BlogRoutes;