import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaTimes } from "react-icons/fa";

const People = () => {
	const { user } = useUser();
	const navigate = useNavigate();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(null);
	const [imageErrors, setImageErrors] = useState({});

	useEffect(() => {
		const fetchUsers = async () => {
			if (!user) return;

			try {
				const response = await fetch("http://localhost:5000/api/users");
				if (response.ok) {
					const data = await response.json();
					const filteredUsers = data.filter(
						(u) => u.clerkId !== user.id
					);
					setUsers(filteredUsers);
					console.log("Fetched users:", filteredUsers);
				} else {
					console.error("Failed to fetch users");
				}
			} catch (error) {
				console.error("Error fetching users:", error);
			} finally {
				setLoading(false);
			}
		};

		if (user) {
			fetchUsers();
		}
	}, [user]);

	const handleUpdateProfile = async () => {
		if (!user) return;
		try {
			await fetch(
				`http://localhost:5000/api/users/clerk/${user.id}/needs-update`,
				{ method: "PATCH" }
			);
			navigate("/info");
		} catch (error) {
			console.error("Update trigger failed:", error);
		}
	};

	const handleLike = async (targetUserId) => {
		if (!user) return;
		setActionLoading(targetUserId + "_like");
		try {
			const response = await fetch(
				`http://localhost:5000/api/users/clerk/${user.id}/like/${targetUserId}`,
				{ method: "POST" }
			);
			if (response.ok) {
				const data = await response.json();
				if (data.match) {
					alert(`You matched with ${data.matchedUser.firstName}!`);
				}
			} else {
				console.error("Failed to like user");
			}
		} catch (error) {
			console.error("Like action failed:", error);
		} finally {
			setActionLoading(null);
		}
	};

	const handleDislike = async (targetUserId) => {
		if (!user) return;
		setActionLoading(targetUserId + "_dislike");
		try {
			await fetch(
				`http://localhost:5000/api/users/clerk/${user.id}/dislike/${targetUserId}`,
				{ method: "POST" }
			);
		} catch (error) {
			console.error("Dislike action failed:", error);
		} finally {
			setActionLoading(null);
		}
	};

	const ImagePlaceholder = ({ firstName, lastName }) => {
		const initials = `${firstName?.charAt(0) || ""}${
			lastName?.charAt(0) || ""
		}`;
		return (
			<div className="w-full h-48 bg-purple-100 flex items-center justify-center">
				<span className="text-purple-600 text-2xl font-bold">
					{initials || "?"}
				</span>
			</div>
		);
	};

	if (!user) {
		return (
			<div className="text-center py-10 text-purple-700">
				Please sign in to view matches
			</div>
		);
	}

	return (
		<div className="container mx-auto p-4 bg-purple-50 min-h-screen">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
					Discover Connections
				</h1>
				<button
					onClick={handleUpdateProfile}
					className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold hover:from-purple-600 hover:to-purple-700"
				>
					Edit Profile
				</button>
			</div>

			{loading ? (
				<div className="text-center py-10 text-purple-700">
					Loading potential matches...
				</div>
			) : users.length === 0 ? (
				<div className="text-center py-10 text-purple-700">
					<FaHeart className="inline-block mb-2 text-purple-500 text-3xl" />
					<p>No new matches found right now</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
					{users.map((userData) => (
						<div
							key={userData._id}
							className="bg-white shadow-sm rounded-xl overflow-hidden relative transition-transform hover:scale-105 hover:shadow-md border border-purple-100"
						>
							<div className="w-full h-56 bg-purple-100 relative">
								{userData.photoUrl &&
								!imageErrors[userData._id] ? (
									<img
										src={userData.photoUrl}
										alt={`${userData.firstName}'s profile`}
										className="w-full h-full object-cover"
										onError={() =>
											setImageErrors((prev) => ({
												...prev,
												[userData._id]: true,
											}))
										}
									/>
								) : (
									<ImagePlaceholder
										firstName={userData.firstName}
										lastName={userData.lastName}
									/>
								)}
							</div>

							<div className="p-4 text-center">
								<h3 className="text-xl font-semibold text-purple-900 mb-1">
									{userData.firstName}
								</h3>
								{userData.lastName && (
									<p className="text-purple-600 text-sm">
										{userData.lastName}
									</p>
								)}
							</div>

							<div className="flex justify-center space-x-4 p-4 border-t border-purple-50">
								<button
									className={`p-3 rounded-full transition-all ${
										actionLoading ===
										userData._id + "_dislike"
											? "bg-purple-100"
											: "hover:bg-purple-50"
									}`}
									onClick={() => handleDislike(userData._id)}
									disabled={
										actionLoading ===
										userData._id + "_dislike"
									}
								>
									{actionLoading ===
									userData._id + "_dislike" ? (
										<div className="w-6 h-6 border-2 border-purple-500 rounded-full animate-spin border-t-transparent" />
									) : (
										<FaTimes className="text-purple-400 text-xl hover:text-purple-500" />
									)}
								</button>

								<button
									className={`p-3 rounded-full transition-all ${
										actionLoading === userData._id + "_like"
											? "bg-pink-100"
											: "hover:bg-pink-50"
									}`}
									onClick={() => handleLike(userData._id)}
									disabled={
										actionLoading === userData._id + "_like"
									}
								>
									{actionLoading ===
									userData._id + "_like" ? (
										<div className="w-6 h-6 border-2 border-pink-500 rounded-full animate-spin border-t-transparent" />
									) : (
										<FaHeart className="text-pink-500 text-xl hover:text-pink-600" />
									)}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default People;
