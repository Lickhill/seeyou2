const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const { uploadToDrive } = require("../googleDrive");

const createUser = async (req, res) => {
	try {
		console.log("Creating user with data:", req.body);
		const { clerkId, firstName, lastName, phone, instagram } = req.body;
		let photoUrl = null;

		// Handle file upload if present
		if (req.file) {
			console.log("File received:", req.file.path);
			try {
				// Ensure uploads directory exists
				const uploadDir = path.join(__dirname, "../uploads");
				if (!fs.existsSync(uploadDir)) {
					fs.mkdirSync(uploadDir, { recursive: true });
				}

				// Upload to Google Drive
				const uploadResult = await uploadToDrive(req.file.path);
				photoUrl = uploadResult.webViewLink; // This is now a direct download URL
				console.log("File uploaded to Google Drive:", photoUrl);

				// Keep the file in uploads folder but log it
				console.log("File saved locally at:", req.file.path);
			} catch (uploadError) {
				console.error("Upload error:", uploadError);
				return res.status(500).json({
					message: "Failed to upload photo",
					error: uploadError.message,
				});
			}
		}

		// Create user in database
		const newUser = await User.create({
			clerkId,
			firstName,
			lastName,
			phone,
			instagram,
			photoUrl,
			updateNeeded: false,
		});

		console.log("User created successfully:", newUser._id);
		res.status(201).json({ message: "User created", user: newUser });
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ message: error.message });
	}
};

const updateUserByClerkId = async (req, res) => {
	try {
		console.log("Updating user:", req.params.clerkId);
		const updates = req.body;

		if (req.file) {
			console.log("Updating user photo:", req.file.path);
			try {
				// Upload to Google Drive
				const uploadResult = await uploadToDrive(req.file.path);
				updates.photoUrl = uploadResult.webViewLink; // This is now a direct download URL
				console.log("New photo URL:", updates.photoUrl);

				// Keep the file in uploads folder
				console.log("File saved locally at:", req.file.path);
			} catch (uploadError) {
				console.error("Photo update error:", uploadError);
				return res.status(500).json({
					message: "Failed to update photo",
					error: uploadError.message,
				});
			}
		}

		// Update user in database
		const updatedUser = await User.findOneAndUpdate(
			{ clerkId: req.params.clerkId },
			{ ...updates, updateNeeded: false },
			{ new: true }
		);

		if (!updatedUser) {
			console.log("User not found for update");
			return res.status(404).json({ message: "User not found" });
		}

		console.log("User updated successfully");
		res.json(updatedUser);
	} catch (error) {
		console.error("Update error:", error);
		res.status(500).json({ message: error.message });
	}
};

// Other controller methods remain the same
const getAllUsers = async (req, res) => {
	try {
		const users = await User.find().select("firstName lastName photoUrl");
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch users" });
	}
};

const getUserByClerkId = async (req, res) => {
	try {
		const user = await User.findOne({ clerkId: req.params.clerkId });
		user
			? res.json({ exists: true, ...user._doc })
			: res.status(404).json({ exists: false });
	} catch (error) {
		res.status(500).json({ message: "Error checking user" });
	}
};

const markUpdateNeeded = async (req, res) => {
	try {
		await User.findOneAndUpdate(
			{ clerkId: req.params.clerkId },
			{ updateNeeded: true }
		);
		res.sendStatus(200);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
// controllers/userController.js

// Add these new functions to your existing controller file

// Like a user
const likeUser = async (req, res) => {
	try {
		const { userId, targetId } = req.params;

		// Find the current user by their MongoDB ID
		const currentUser = await User.findById(userId);
		if (!currentUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Find the target user
		const targetUser = await User.findById(targetId);
		if (!targetUser) {
			return res.status(404).json({ message: "Target user not found" });
		}

		// Check if already liked
		if (currentUser.likes.includes(targetId)) {
			return res.status(400).json({ message: "User already liked" });
		}

		// Add target to likes
		currentUser.likes.push(targetId);

		// Remove from dislikes if present
		currentUser.dislikes = currentUser.dislikes.filter(
			(id) => id.toString() !== targetId
		);

		await currentUser.save();

		// Check if this creates a match (if target user also liked current user)
		let isMatch = false;
		let matchedUser = null;

		if (targetUser.likes.includes(userId)) {
			// It's a match!
			isMatch = true;
			matchedUser = targetUser;

			// Add to matches for both users if not already matched
			if (!currentUser.matches.includes(targetId)) {
				currentUser.matches.push(targetId);
				await currentUser.save();
			}

			if (!targetUser.matches.includes(userId)) {
				targetUser.matches.push(userId);
				await targetUser.save();
			}
		}

		res.status(200).json({
			message: "User liked successfully",
			match: isMatch,
			matchedUser: isMatch
				? {
						_id: matchedUser._id,
						firstName: matchedUser.firstName,
						lastName: matchedUser.lastName,
				  }
				: null,
		});
	} catch (error) {
		console.error("Error liking user:", error);
		res.status(500).json({ message: "Failed to like user" });
	}
};

// Dislike a user
const dislikeUser = async (req, res) => {
	try {
		const { userId, targetId } = req.params;

		// Find the current user
		const currentUser = await User.findById(userId);
		if (!currentUser) {
			return res.status(404).json({ message: "User not found" });
		}

		// Check if already disliked
		if (currentUser.dislikes.includes(targetId)) {
			return res.status(400).json({ message: "User already disliked" });
		}

		// Add target to dislikes
		currentUser.dislikes.push(targetId);

		// Remove from likes and matches if present
		currentUser.likes = currentUser.likes.filter(
			(id) => id.toString() !== targetId
		);

		currentUser.matches = currentUser.matches.filter(
			(id) => id.toString() !== targetId
		);

		await currentUser.save();

		res.status(200).json({ message: "User disliked successfully" });
	} catch (error) {
		console.error("Error disliking user:", error);
		res.status(500).json({ message: "Failed to dislike user" });
	}
};

// Get user by MongoDB ID (helper for like/dislike)
const getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(user);
	} catch (error) {
		console.error("Error finding user:", error);
		res.status(500).json({ message: "Failed to find user" });
	}
};

// Get current user's matches

const getMongoIdFromClerkId = async (clerkId) => {
	const user = await User.findOne({ clerkId });
	if (!user) {
		throw new Error("User not found");
	}
	return user._id;
};

// Updated like/dislike routes that accept Clerk IDs
const likeUserByClerkId = async (req, res) => {
	try {
		const { clerkId, targetId } = req.params;

		// Convert Clerk ID to MongoDB ID
		const userId = await getMongoIdFromClerkId(clerkId);

		// Redirect to the original likeUser function
		req.params.userId = userId;
		return likeUser(req, res);
	} catch (error) {
		console.error("Error liking user:", error);
		res.status(500).json({ message: "Failed to like user" });
	}
};

const dislikeUserByClerkId = async (req, res) => {
	try {
		const { clerkId, targetId } = req.params;

		// Convert Clerk ID to MongoDB ID
		const userId = await getMongoIdFromClerkId(clerkId);

		// Redirect to the original dislikeUser function
		req.params.userId = userId;
		return dislikeUser(req, res);
	} catch (error) {
		console.error("Error disliking user:", error);
		res.status(500).json({ message: "Failed to dislike user" });
	}
};

const getUserMatches = async (req, res) => {
	try {
		// Find the user by their Clerk ID
		const user = await User.findOne({ clerkId: req.params.clerkId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Fetch users that are in the matches array
		const matches = await User.find({
			_id: { $in: user.matches },
		}).select("firstName lastName photoUrl instagram phone");

		res.json(matches);
	} catch (error) {
		console.error("Error fetching matches:", error);
		res.status(500).json({ message: "Failed to fetch matches" });
	}
};

// Get user's match count
const getUserMatchCount = async (req, res) => {
	try {
		const user = await User.findOne({ clerkId: req.params.clerkId });
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const count = await User.countDocuments({
			_id: { $in: user.likes },
			likes: user._id,
		});

		res.json({ count });
	} catch (error) {
		console.error("Error fetching match count:", error);
		res.status(500).json({ message: "Failed to fetch match count" });
	}
};

// Export the new functions
module.exports = {
	createUser,
	getAllUsers,
	getUserByClerkId,
	updateUserByClerkId,
	markUpdateNeeded,
	likeUser,
	dislikeUser,
	getUserById,
	getUserMatches,
	getMongoIdFromClerkId,
	likeUserByClerkId,
	dislikeUserByClerkId,
	getUserMatchCount,
};
