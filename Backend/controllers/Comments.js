import PostModel from "../models/Blog.js";
import CommentModel from "../models/Comment.js";
import UserModel from "../models/User.js";
import { isCleanContent } from '../utils/FilterContent.js';

const AddComment = async (req, res) => {
    try {
        const { postId, comment } = req.body;
        const userId = req.user._id;

        if (!comment || !postId) {
            return res.status(400).json({ success: false, message: 'Comment and postId are required' });
        }

        if (!isCleanContent(comment)) {
            const userToBan = await UserModel.findById(userId);
            if (userToBan) {
                userToBan.status = 'banned';
                await userToBan.save();
            }
            return res.status(403).json({ success: false, message: 'You have been permanently banned for attempting to post harmful content.' });
        }

        const blogPost = await PostModel.findById(postId);
        if (!blogPost) {
            return res.status(404).json({ success: false, message: 'Blog post not found' });
        }

        const newComment = new CommentModel({
            postId,
            userId,
            comment
        });

        await newComment.save();

        blogPost.comments.push(newComment._id);
        await blogPost.save();

        const populatedComment = await CommentModel.findById(newComment._id)
            .populate('userId', 'FullName profile');

        res.status(201).json({ success: true, message: 'Comment added successfully', comment: populatedComment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const DeleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.user._id;

        const comment = await CommentModel.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: 'Comment not found' });
        }

        // Only comment owner or admin can delete
        if (comment.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
        }

        // Remove comment reference from the post
        await PostModel.findByIdAndUpdate(comment.postId, {
            $pull: { comments: commentId }
        });

        await CommentModel.findByIdAndDelete(commentId);

        res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const GetComments = async (req, res) => {
    try {
        const postId = req.params.postId;
        const comments = await CommentModel.find({ postId })
            .populate('userId', 'FullName profile')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, comments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { AddComment, DeleteComment, GetComments };
