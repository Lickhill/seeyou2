const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
	createUser,
	getAllUsers,
	getUserByClerkId,
	updateUserByClerkId,
	markUpdateNeeded,
	likeUser,
	dislikeUser,
	getUserMatches,
	getUserById,
	likeUserByClerkId,
	dislikeUserByClerkId,
} = require("../controllers/userController");

const router = express.Router();

// Ensure uploads directory exists
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
	fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		// Create unique filename with original extension
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, uniqueSuffix + ext);
	},
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
	const allowedTypes = [".jpg", ".jpeg", ".png"];
	const ext = path.extname(file.originalname).toLowerCase();

	if (allowedTypes.includes(ext)) {
		cb(null, true);
	} else {
		cb(new Error("Only JPG, JPEG and PNG files are allowed"), false);
	}
};

// Configure multer with storage, file filter and size limits
const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Routes
router.post("/users", upload.single("photo"), createUser);
router.get("/users", getAllUsers);
router.get("/users/clerk/:clerkId", getUserByClerkId);
router.put(
	"/users/clerk/:clerkId",
	upload.single("photo"),
	updateUserByClerkId
);
router.patch("/users/clerk/:clerkId/needs-update", markUpdateNeeded);

// Error handling middleware for multer errors
router.use((err, req, res, next) => {
	if (err instanceof multer.MulterError) {
		return res
			.status(400)
			.json({ message: `Upload error: ${err.message}` });
	} else if (err) {
		return res.status(400).json({ message: err.message });
	}
	next();
});

router.post("/users/:userId/like/:targetId", likeUser);
router.post("/users/:userId/dislike/:targetId", dislikeUser);
router.get("/users/:id", getUserById);
router.get("/users/:id/matches", getUserMatches);

router.post("/users/clerk/:clerkId/like/:targetId", likeUserByClerkId);
router.post("/users/clerk/:clerkId/dislike/:targetId", dislikeUserByClerkId);

// Define the route for fetching user matches
router.get("/users/clerk/:clerkId/matches", getUserMatches);

module.exports = router;
