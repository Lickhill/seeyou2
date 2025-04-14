require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

const cors = require("cors");

app.use(cors()); // Enable CORS for all routes

// Connect to MongoDB
mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("MongoDB connected"))
	.catch((err) => console.error("MongoDB connection error:", err));

// Use routes
app.use("/api", userRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
