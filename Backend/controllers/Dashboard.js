import PostModel from "../models/Blog.js";
import CommentModel from "../models/Comment.js";
import UserModel from "../models/User.js";

const Dashboard = async (req, res) => {
    try {
        const Users = await UserModel.find().select('-password');
        const Posts = await PostModel.find().populate('author', 'FullName profile');
        const comments = await CommentModel.find().populate('userId', 'FullName');

        res.status(200).json({ success: true, Users, Posts, comments });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const GetUsers = async (req, res) => {
    try {
        const Users = await UserModel.find().select('-password');
        if (!Users) {
            return res.status(404).json({ success: false, message: "No Data Found" });
        }
        res.status(200).json({ success: true, Users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const Delete = async (req, res) => {
    try {
        const userId = req.params.id;
        const ExistUser = await UserModel.findById(userId);
        if (!ExistUser) {
            return res.status(404).json({ success: false, message: "No User Found" });
        }
        if (ExistUser.role === 'admin') {
            return res.status(403).json({ success: false, message: "Cannot delete admin account" });
        }

        // Clean up user's posts and comments
        await PostModel.deleteMany({ author: userId });
        await CommentModel.deleteMany({ userId: userId });

        // Remove from followers/following lists
        await UserModel.updateMany(
            { followers: userId },
            { $pull: { followers: userId } }
        );
        await UserModel.updateMany(
            { following: userId },
            { $pull: { following: userId } }
        );

        await UserModel.findByIdAndDelete(userId);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { Dashboard, GetUsers, Delete };