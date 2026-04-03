import express from 'express';
import { AddComment, DeleteComment, GetComments } from '../controllers/Comments.js';
import { isLogin } from '../middleware/CheckAdmin.js';

const CommentRoutes = express.Router();

CommentRoutes.post('/addcomment', isLogin, AddComment);
CommentRoutes.delete('/delete/:id', isLogin, DeleteComment);
CommentRoutes.get('/post/:postId', GetComments);

export default CommentRoutes;