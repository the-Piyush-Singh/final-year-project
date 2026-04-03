import jwt from 'jsonwebtoken';
import UserModel from '../models/User.js';
import bcrypt from 'bcryptjs';

const Register = async (req, res) => {
    try {
        const { FullName, email, password } = req.body;

        if (!FullName || !email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existUser = await UserModel.findOne({ email });
        if (existUser) {
            return res.status(409).json({ success: false, message: "User already exists. Please login." });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const newUser = new UserModel({
            FullName,
            email,
            password: hashedPassword,
            profile: req.file ? req.file.filename : '',
        });

        await newUser.save();

        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({ success: true, message: 'User registered successfully', user: userResponse });
    } catch (error) {
        console.error('Error during registration', error);
        res.status(500).json({ success: false, message: 'Error during registration' });
    }
};

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const FindUser = await UserModel.findOne({ email });
        if (!FindUser) {
            return res.status(404).json({ success: false, message: "Account not found. Please register." });
        }

        if (FindUser.status === 'banned') {
            return res.status(403).json({ success: false, message: 'Your account has been permanently banned from the platform.' });
        }

        const comparePassword = await bcrypt.compare(password, FindUser.password);
        if (!comparePassword) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign({ userId: FindUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const userResponse = FindUser.toObject();
        delete userResponse.password;

        return res.status(200).json({ success: true, message: "Login successfully", user: userResponse, token });
    } catch (error) {
        console.error('Error during login', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const Logout = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ success: true, message: "Logout successful" });
    } catch (error) {
        console.error("Error logging out:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getMe = async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { FullName, bio, oldpassword, newpassword } = req.body;

        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ success: false, message: "You can only update your own profile." });
        }

        const ExistUser = await UserModel.findById(userId);
        if (!ExistUser) {
            return res.status(404).json({ success: false, message: "Account not found." });
        }

        if (oldpassword) {
            const comparePassword = await bcrypt.compare(oldpassword, ExistUser.password);
            if (!comparePassword) {
                return res.status(401).json({ success: false, message: "Old password is incorrect." });
            }
        }

        if (FullName) ExistUser.FullName = FullName;
        if (bio !== undefined) ExistUser.bio = bio;

        if (oldpassword && newpassword) {
            const hashedPassword = await bcrypt.hash(newpassword, 10);
            ExistUser.password = hashedPassword;
        } else if (oldpassword && !newpassword) {
            return res.status(400).json({ success: false, message: "New password is required when old password is provided." });
        }

        if (req.file) {
            ExistUser.profile = req.file.filename;
        }

        await ExistUser.save();

        const userResponse = ExistUser.toObject();
        delete userResponse.password;

        res.status(200).json({ success: true, message: "Profile updated successfully.", user: userResponse });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export { Register, Login, Logout, getMe, updateProfile };