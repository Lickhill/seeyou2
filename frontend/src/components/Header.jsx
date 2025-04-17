// src/components/Header.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
	useUser,
} from "@clerk/clerk-react";
import axios from "axios";

const Header = () => {
	const { user } = useUser();
	const [matchCount, setMatchCount] = useState(0);

	useEffect(() => {
		if (user) {
			fetchMatchCount();
		}
	}, [user]);

	const fetchMatchCount = async () => {
		try {
			const response = await axios.get(
				`/api/users/${user.id}/match-count`
			);
			setMatchCount(response.data.count);
		} catch (error) {
			console.error("Error fetching match count:", error);
		}
	};

	return (
		<header className="bg-purple-50 shadow-sm py-4 px-6 border-b border-purple-100">
			<div className="container mx-auto flex justify-between items-center">
				<Link
					to="/"
					className="text-xl font-bold text-purple-800 hover:text-purple-700 transition-colors flex items-center"
				>
					<svg
						className="w-6 h-6 mr-2 text-purple-600"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fillRule="evenodd"
							d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
							clipRule="evenodd"
						/>
					</svg>
					SeeYou
				</Link>

				<nav className="flex items-center space-x-6">
					<Link
						to="/people"
						className="text-purple-900/90 hover:text-purple-700 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-purple-100/50"
					>
						Discover
					</Link>
					<SignedIn>
						<Link
							to="/matches"
							className="text-purple-900/90 hover:text-purple-700 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-purple-100/50 flex items-center relative"
						>
							Matches
							{matchCount > 0 && (
								<span className="ml-2 bg-purple-500 text-white text-xs rounded-full px-2 py-1 shadow-sm">
									{matchCount}
								</span>
							)}
						</Link>
					</SignedIn>
					<div className="ml-2">
						<SignedIn>
							<UserButton
								appearance={{
									elements: {
										userButtonAvatarBox: "w-9 h-9",
										userButtonOuterIdentifier:
											"text-purple-900/80 font-medium",
									},
								}}
							/>
						</SignedIn>
						<SignedOut>
							<SignInButton mode="modal">
								<button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-lg transition-shadow font-medium hover:from-purple-600 hover:to-purple-700">
									Get Started
								</button>
							</SignInButton>
						</SignedOut>
					</div>
				</nav>
			</div>
		</header>
	);
};

export default Header;
