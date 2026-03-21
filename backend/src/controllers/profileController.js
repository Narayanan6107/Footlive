import User from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const profileData = user.toObject();
        profileData.joinDate = profileData.createdAt;
        res.json(profileData);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { bio, username, email, favoriteFormation } = req.body;
        const updateData = {};
        if (bio !== undefined) updateData.bio = bio;
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (favoriteFormation !== undefined) updateData.favoriteFormation = favoriteFormation;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId, 
            updateData, 
            { new: true }
        ).select('-password');

        const profileData = updatedUser.toObject();
        profileData.joinDate = profileData.createdAt;
        res.json(profileData);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
