import UserModel from "../models/User.js";
import PostModel from "../models/Blog.js";

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await UserModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const postCount = await PostModel.countDocuments({ author: userId, status: 'published' });
        const recentPosts = await PostModel.find({ author: userId, status: 'published' })
            .populate('author', 'FullName profile')
            .sort({ createdAt: -1 })
            .limit(6);

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                FullName: user.FullName,
                email: user.email,
                profile: user.profile,
                bio: user.bio,
                role: user.role,
                followers: user.followers,
                following: user.following,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                postCount,
                createdAt: user.createdAt
            },
            posts: recentPosts
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getSavedPosts = async (req, res) => {
    try {
        const userId = req.params.id;

        // Security check: Only the owner can see their saved posts
        if (req.user._id.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const user = await UserModel.findById(userId).populate({
            path: 'savedPosts',
            match: { status: 'published' },
            populate: { path: 'author', select: 'FullName profile' }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, savedPosts: user.savedPosts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { getUserProfile, getSavedPosts };
