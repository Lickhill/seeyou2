const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

// Define MIME types for supported image formats
const getMimeType = (filePath) => {
	const ext = path.extname(filePath).toLowerCase();
	switch (ext) {
		case ".png":
			return "image/png";
		case ".jpg":
		case ".jpeg":
			return "image/jpeg";
		default:
			return "application/octet-stream"; // Default fallback
	}
};

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
	keyFile: path.join(__dirname, "../google-credentials.json"),
	scopes: ["https://www.googleapis.com/auth/drive"],
});

// Create Drive client
const drive = google.drive({ version: "v3", auth });

/**
 * Upload file to Google Drive and make it publicly accessible
 */
async function uploadToDrive(filePath) {
	try {
		// Get file name and MIME type
		const fileName = path.basename(filePath);
		const mimeType = getMimeType(filePath);

		console.log(`Uploading ${fileName} (${mimeType}) to Google Drive...`);

		// Create file in Google Drive
		const fileMetadata = {
			name: fileName,
		};

		const media = {
			mimeType: mimeType,
			body: fs.createReadStream(filePath),
		};

		// Upload the file
		const response = await drive.files.create({
			resource: fileMetadata,
			media: media,
			fields: "id",
		});

		const fileId = response.data.id;
		console.log(`File uploaded with ID: ${fileId}`);

		// Make the file publicly accessible
		await drive.permissions.create({
			fileId: fileId,
			requestBody: {
				role: "reader",
				type: "anyone",
			},
		});

		console.log("File permissions updated to public");

		// Get direct download link instead of web view link
		const directDownloadUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;

		return {
			fileId: fileId,
			webViewLink: directDownloadUrl,
			webContentLink: directDownloadUrl,
		};
	} catch (error) {
		console.error("Google Drive upload error:", error);
		throw new Error(`Failed to upload to Google Drive: ${error.message}`);
	}
}

module.exports = { uploadToDrive };
