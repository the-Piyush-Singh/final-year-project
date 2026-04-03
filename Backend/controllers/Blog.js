import PostModel from "../models/Blog.js";
import CommentModel from "../models/Comment.js";
import UserModel from "../models/User.js";
import fs from 'fs';
import path from 'path';
import { isCleanContent } from '../utils/FilterContent.js';

const Create = async (req, res) => {
    try {
        const { title, desc, content, tags, status } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }

        if (!isCleanContent(title) || !isCleanContent(desc) || !isCleanContent(content)) {
            const userToBan = await UserModel.findById(req.user._id);
            if (userToBan) {
                userToBan.status = 'banned';
                await userToBan.save();
            }
            return res.status(403).json({ success: false, message: 'You have been permanently banned for attempting to post harmful content.' });
        }

        const postData = {
            title,
            desc: desc || '',
            content: content || '',
            author: req.user._id,
            status: status || 'published',
            image: req.file ? req.file.filename : ''
        };

        if (tags) {
            postData.tags = typeof tags === 'string'
                ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
                : tags;
        }

        const newPost = new PostModel(postData);
        await newPost.save();

        const populatedPost = await PostModel.findById(newPost._id).populate('author', 'FullName profile');

        res.status(201).json({
            success: true,
            message: 'Post created successfully',
            blog: populatedPost
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const update = async (req, res) => {
    try {
        const { title, desc, content, tags, status } = req.body;
        const blogId = req.params.id;

        const blogToUpdate = await PostModel.findById(blogId);
        if (!blogToUpdate) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Only author or admin can update
        if (blogToUpdate.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
        }

        if ((title && !isCleanContent(title)) || (desc !== undefined && !isCleanContent(desc)) || (content !== undefined && !isCleanContent(content))) {
            const userToBan = await UserModel.findById(req.user._id);
            if (userToBan) {
                userToBan.status = 'banned';
                await userToBan.save();
            }
            return res.status(403).json({ success: false, message: 'You have been permanently banned for attempting to post harmful content.' });
        }

        if (title) blogToUpdate.title = title;
        if (desc !== undefined) blogToUpdate.desc = desc;
        if (content !== undefined) blogToUpdate.content = content;
        if (status) blogToUpdate.status = status;
        if (req.file) blogToUpdate.image = req.file.filename;

        if (tags) {
            blogToUpdate.tags = typeof tags === 'string'
                ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
                : tags;
        }

        await blogToUpdate.save();

        const populatedPost = await PostModel.findById(blogToUpdate._id).populate('author', 'FullName profile');

        res.status(200).json({ success: true, message: 'Post updated successfully', blog: populatedPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const GetPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const tag = req.query.tag;
        const search = req.query.search;

        let filter = { status: 'published' };
        if (tag) filter.tags = tag.toLowerCase();
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { desc: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await PostModel.countDocuments(filter);
        const posts = await PostModel.find(filter)
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
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const GetSinglePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await PostModel.findByIdAndUpdate(postId, { $inc: { views: 1 } }, { new: true })
            .populate('author', 'FullName profile bio followers following')
            .populate({
                path: 'comments',
                populate: {
                    path: 'userId',
                    select: 'FullName profile'
                },
                options: { sort: { createdAt: -1 } }
            });

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        res.status(200).json({ success: true, Post: post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const GetUserPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const filter = { author: userId, status: 'published' };
        const total = await PostModel.countDocuments(filter);
        const posts = await PostModel.find(filter)
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
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const GetMyPosts = async (req, res) => {
    try {
        const posts = await PostModel.find({ author: req.user._id })
            .populate('author', 'FullName profile')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const LikeToggle = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(userId);
        let liked;

        if (likeIndex === -1) {
            post.likes.push(userId);
            liked = true;
        } else {
            post.likes.splice(likeIndex, 1);
            liked = false;
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: liked ? 'Post liked' : 'Post unliked',
            liked,
            likesCount: post.likes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const DeleteBlog = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await PostModel.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Only author or admin can delete
        if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
        }

        if (post.image) {
            const imagePath = path.join('public/images', post.image);
            fs.promises.unlink(imagePath).catch(err => console.error('Error deleting image:', err));
        }

        // Delete associated comments
        await CommentModel.deleteMany({ postId: postId });

        await PostModel.findByIdAndDelete(postId);

        res.status(200).json({ success: true, message: "Post deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const SavePostToggle = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const userObj = await UserModel.findById(userId);

        if (!userObj) return res.status(404).json({ success: false, message: 'User not found' });

        const saveIndex = userObj.savedPosts.indexOf(postId);
        let saved;

        if (saveIndex === -1) {
            userObj.savedPosts.push(postId);
            saved = true;
        } else {
            userObj.savedPosts.splice(saveIndex, 1);
            saved = false;
        }

        await userObj.save();

        res.status(200).json({
            success: true,
            message: saved ? 'Post saved' : 'Post unsaved',
            saved,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export { Create, update, GetPosts, GetSinglePost, GetUserPosts, GetMyPosts, LikeToggle, DeleteBlog, SavePostToggle };
