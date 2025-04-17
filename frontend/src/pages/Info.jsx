import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Info = () => {
	const { user, isLoaded } = useUser();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		phone: "",
		instagram: "",
	});
	const [photo, setPhoto] = useState(null);
	const [photoPreview, setPhotoPreview] = useState(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);

	// Check if user exists and fetch data if updating
	useEffect(() => {
		const checkUserState = async () => {
			if (!isLoaded || !user) return;

			try {
				const response = await fetch(
					`http://localhost:5000/api/users/clerk/${user.id}`
				);
				if (response.ok) {
					const userData = await response.json();
					if (userData.exists && !userData.updateNeeded) {
						navigate("/people");
					} else if (userData.exists) {
						setIsUpdating(true);
						setFormData({
							firstName: userData.firstName || "",
							lastName: userData.lastName || "",
							phone: userData.phone || "",
							instagram: userData.instagram || "",
						});
						if (userData.photoUrl) {
							setExistingPhotoUrl(userData.photoUrl);
						}
					}
				}
			} catch (error) {
				console.error("Error checking user:", error);
			} finally {
				setLoading(false);
			}
		};
		checkUserState();
	}, [isLoaded, user, navigate]);

	// Handle form field changes
	const handleChange = (e) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	// Handle photo upload with preview
	const handlePhotoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate file type
			const validTypes = ["image/jpeg", "image/jpg", "image/png"];
			if (!validTypes.includes(file.type)) {
				alert("Please select a valid image file (JPG, JPEG, or PNG)");
				return;
			}

			// Validate file size (5MB max)
			if (file.size > 5 * 1024 * 1024) {
				alert("File size must be less than 5MB");
				return;
			}

			setPhoto(file);

			// Create preview
			const reader = new FileReader();
			reader.onloadend = () => {
				setPhotoPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const formDataObj = new FormData();

			// Add clerkId if creating new user
			if (!isUpdating) {
				formDataObj.append("clerkId", user.id);
			}

			// Add form fields
			formDataObj.append("firstName", formData.firstName);
			formDataObj.append("lastName", formData.lastName);
			formDataObj.append("phone", formData.phone);
			formDataObj.append("instagram", formData.instagram);

			// Add photo if selected
			if (photo) {
				formDataObj.append("photo", formData.photo);
			}

			// Determine URL and method based on update status
			const url = isUpdating
				? `http://localhost:5000/api/users/clerk/${user.id}`
				: "http://localhost:5000/api/users";
			const method = isUpdating ? "PUT" : "POST";

			console.log(`Submitting form to ${url} with method ${method}`);

			const response = await fetch(url, {
				method,
				body: formDataObj,
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Submission failed");
			}

			// Navigate to people page on success
			navigate("/people");
		} catch (error) {
			console.error("Submission error:", error);
			alert(`Error: ${error.message}`);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="text-center p-8">Loading...</div>;

	return (
		<div className="max-w-md mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">
				{isUpdating ? "Update Your Profile" : "Complete Your Profile"}
			</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label className="block mb-2">
						First Name:
						<input
							type="text"
							name="firstName"
							value={formData.firstName}
							onChange={handleChange}
							className="w-full p-2 border rounded"
							required
						/>
					</label>
				</div>
				<div>
					<label className="block mb-2">
						Last Name:
						<input
							type="text"
							name="lastName"
							value={formData.lastName}
							onChange={handleChange}
							className="w-full p-2 border rounded"
						/>
					</label>
				</div>
				<div>
					<label className="block mb-2">
						Phone:
						<input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							className="w-full p-2 border rounded"
						/>
					</label>
				</div>
				<div>
					<label className="block mb-2">
						Instagram:
						<input
							type="text"
							name="instagram"
							value={formData.instagram}
							onChange={handleChange}
							className="w-full p-2 border rounded"
						/>
					</label>
				</div>
				<div>
					<label className="block mb-2">
						Photo:
						<input
							type="file"
							accept=".jpg,.jpeg,.png"
							onChange={handlePhotoChange}
							className="w-full p-2 border rounded"
						/>
					</label>

					{/* Show photo preview if available */}
					{photoPreview && (
						<div className="mt-2">
							<p className="text-sm text-gray-600 mb-1">
								New photo preview:
							</p>
							<img
								src={photoPreview}
								alt="Preview"
								className="w-32 h-32 object-cover rounded"
							/>
						</div>
					)}

					{/* Show existing photo if available */}
					{!photoPreview && existingPhotoUrl && (
						<div className="mt-2">
							<p className="text-sm text-gray-600 mb-1">
								Current photo:
							</p>
							<img
								src={existingPhotoUrl}
								alt="Current"
								className="w-32 h-32 object-cover rounded"
							/>
						</div>
					)}
				</div>
				<button
					type="submit"
					disabled={submitting}
					className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
				>
					{submitting
						? "Submitting..."
						: isUpdating
						? "Update Profile"
						: "Create Profile"}
				</button>
			</form>
		</div>
	);
};

export default Info;
