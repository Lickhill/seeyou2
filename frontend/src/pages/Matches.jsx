import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

const Matches = () => {
	const { user } = useUser();
	const [matches, setMatches] = useState([]);
	const [loading, setLoading] = useState(true);
	const [imageErrors, setImageErrors] = useState({});

	useEffect(() => {
		if (user) {
			fetchMatches();
		}
	}, [user]);

	const fetchMatches = async () => {
		try {
			const response = await axios.get(
				`http://localhost:5000/api/users/clerk/${user.id}/matches`
			);
			setMatches(response.data);
			console.log("Fetched matches:", response.data);
		} catch (error) {
			console.error("Error fetching matches:", error);
		} finally {
			setLoading(false);
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

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6">Your Matches</h1>
			{loading ? (
				<div className="text-center py-10">Loading matches...</div>
			) : matches.length === 0 ? (
				<div className="text-center py-10">No matches found</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{matches.map((match) => (
						<div
							key={match._id}
							className="bg-white rounded-lg shadow-md p-6"
						>
							<div className="w-full h-48 bg-purple-100 relative mb-4">
								{match.photoUrl && !imageErrors[match._id] ? (
									<img
										src={match.photoUrl}
										alt={`${match.firstName} ${match.lastName}`}
										className="w-full h-full object-cover rounded-md"
										onError={() =>
											setImageErrors((prev) => ({
												...prev,
												[match._id]: true,
											}))
										}
									/>
								) : (
									<ImagePlaceholder
										firstName={match.firstName}
										lastName={match.lastName}
									/>
								)}
							</div>
							<h2 className="text-xl font-semibold mb-2">
								{match.firstName} {match.lastName}
							</h2>
							{match.instagram && (
								<p className="text-gray-600 mb-1">
									<span className="font-semibold">
										Instagram:
									</span>{" "}
									{match.instagram}
								</p>
							)}
							{match.phone && (
								<p className="text-gray-600">
									<span className="font-semibold">
										Phone:
									</span>{" "}
									{match.phone}
								</p>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Matches;
