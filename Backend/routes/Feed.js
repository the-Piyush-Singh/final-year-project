import express from 'express';
import { getRecommendedFeed, getTrendingPosts, getFollowingFeed } from '../controllers/Feed.js';
import { isLogin } from '../middleware/CheckAdmin.js';

const FeedRoutes = express.Router();

FeedRoutes.get('/recommended', isLogin, getRecommendedFeed);
FeedRoutes.get('/trending', getTrendingPosts);
FeedRoutes.get('/following', isLogin, getFollowingFeed);

export default FeedRoutes;
