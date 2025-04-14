const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	clerkId: {
		type: String,
		required: true,
		unique: true,
	},
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
	},
	phone: {
		type: String,
	},
	instagram: {
		type: String,
	},
	photoUrl: {
		type: String,
	},
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	dislikes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	matches: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updateNeeded: {
		type: Boolean,
		default: true, // New users need to complete profile
	},
});

module.exports = mongoose.model("User", userSchema);
