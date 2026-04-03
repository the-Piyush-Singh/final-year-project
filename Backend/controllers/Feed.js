import PostModel from "../models/Blog.js";
import UserModel from "../models/User.js";

const getRecommendedFeed = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const currentUser = await UserModel.findById(userId);

        // Get user's liked posts to extract preferred tags
        const likedPosts = await PostModel.find({ likes: userId });
        const preferredTags = [...new Set(likedPosts.flatMap(p => p.tags))];

        let recommendedPosts = [];
        const seenIds = new Set();

        // Priority 1: Posts from followed users
        if (currentUser.following.length > 0) {
            const followingPosts = await PostModel.find({
                author: { $in: currentUser.following },
                status: 'published',
                author: { $ne: userId }
            })
                .populate('author', 'FullName profile')
                .sort({ createdAt: -1 })
                .limit(limit);

            followingPosts.forEach(p => {
                if (!seenIds.has(p._id.toString())) {
                    seenIds.add(p._id.toString());
                    recommendedPosts.push(p);
                }
            });
        }

        // Priority 2: Posts matching preferred tags
        if (preferredTags.length > 0 && recommendedPosts.length < limit) {
            const tagPosts = await PostModel.find({
                tags: { $in: preferredTags },
                status: 'published',
                author: { $ne: userId },
                _id: { $nin: [...seenIds] }
            })
                .populate('author', 'FullName profile')
                .sort({ createdAt: -1 })
                .limit(limit - recommendedPosts.length);

            tagPosts.forEach(p => {
                if (!seenIds.has(p._id.toString())) {
                    seenIds.add(p._id.toString());
                    recommendedPosts.push(p);
                }
            });
        }

        // Priority 3: Trending posts (most likes + comments in last 7 days)
        if (recommendedPosts.length < limit) {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const trendingPosts = await PostModel.aggregate([
                {
                    $match: {
                        status: 'published',
                        createdAt: { $gte: sevenDaysAgo },
                        author: { $ne: userId },
                        _id: { $nin: [...seenIds].map(id => id) }
                    }
                },
                {
                    $addFields: {
                        engagement: {
                            $add: [
                                { $size: { $ifNull: ['$likes', []] } },
                                { $size: { $ifNull: ['$comments', []] } }
                            ]
                        }
                    }
                },
                { $sort: { engagement: -1 } },
                { $limit: limit - recommendedPosts.length }
            ]);

            if (trendingPosts.length > 0) {
                const populated = await PostModel.populate(trendingPosts, {
                    path: 'author',
                    select: 'FullName profile'
                });
                populated.forEach(p => {
                    if (!seenIds.has(p._id.toString())) {
                        seenIds.add(p._id.toString());
                        recommendedPosts.push(p);
                    }
                });
            }
        }

        // Priority 4: Recent posts as fallback
        if (recommendedPosts.length < limit) {
            const recentPosts = await PostModel.find({
                status: 'published',
                author: { $ne: userId },
                _id: { $nin: [...seenIds] }
            })
                .populate('author', 'FullName profile')
                .sort({ createdAt: -1 })
                .limit(limit - recommendedPosts.length);

            recentPosts.forEach(p => {
                if (!seenIds.has(p._id.toString())) {
                    seenIds.add(p._id.toString());
                    recommendedPosts.push(p);
                }
            });
        }

        // Paginate the results
        const paginatedPosts = recommendedPosts.slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            posts: paginatedPosts,
            pagination: {
                current: page,
                total: recommendedPosts.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getTrendingPosts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 12;
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const trendingPosts = await PostModel.aggregate([
            {
                $match: {
                    status: 'published',
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $addFields: {
                    engagement: {
                        $add: [
                            { $multiply: [{ $size: { $ifNull: ['$likes', []] } }, 2] },
                            { $size: { $ifNull: ['$comments', []] } }
                        ]
                    }
                }
            },
            { $sort: { engagement: -1 } },
            { $limit: limit }
        ]);

        const populated = await PostModel.populate(trendingPosts, {
            path: 'author',
            select: 'FullName profile'
        });

        res.status(200).json({ success: true, posts: populated });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getFollowingFeed = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const currentUser = await UserModel.findById(userId);

        if (!currentUser.following.length) {
            return res.status(200).json({ success: true, posts: [], pagination: { current: page, total: 0 } });
        }

        const total = await PostModel.countDocuments({
            author: { $in: currentUser.following },
            status: 'published'
        });

        const posts = await PostModel.find({
            author: { $in: currentUser.following },
            status: 'published'
        })
            .populate('author', 'FullName profile')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            success: true,
            posts,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { getRecommendedFeed, getTrendingPosts, getFollowingFeed };
