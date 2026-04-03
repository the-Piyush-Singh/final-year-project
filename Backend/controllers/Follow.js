import UserModel from "../models/User.js";

const followUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot follow yourself" });
        }

        const targetUser = await UserModel.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const currentUser = await UserModel.findById(currentUserId);

        // Check if already following
        if (currentUser.following.includes(targetUserId)) {
            return res.status(400).json({ success: false, message: "Already following this user" });
        }

        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            success: true,
            message: `You are now following ${targetUser.FullName}`,
            followersCount: targetUser.followers.length,
            followingCount: currentUser.following.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ success: false, message: "You cannot unfollow yourself" });
        }

        const targetUser = await UserModel.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const currentUser = await UserModel.findById(currentUserId);

        if (!currentUser.following.includes(targetUserId)) {
            return res.status(400).json({ success: false, message: "You are not following this user" });
        }

        currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({
            success: true,
            message: `You unfollowed ${targetUser.FullName}`,
            followersCount: targetUser.followers.length,
            followingCount: currentUser.following.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { followUser, unfollowUser };
