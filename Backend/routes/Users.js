import express from 'express';
import { followUser, unfollowUser } from '../controllers/Follow.js';
import { getUserProfile, getSavedPosts } from '../controllers/UserProfile.js';
import { isLogin } from '../middleware/CheckAdmin.js';

const UserRoutes = express.Router();

UserRoutes.get('/:id/profile', getUserProfile);
UserRoutes.post('/:id/follow', isLogin, followUser);
UserRoutes.delete('/:id/follow', isLogin, unfollowUser);
UserRoutes.get('/:id/saved-posts', isLogin, getSavedPosts);

export default UserRoutes;
