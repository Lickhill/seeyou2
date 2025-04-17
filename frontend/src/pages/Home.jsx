// src/App.jsx
import React, { useState, useEffect } from "react";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
	const { isSignedIn, user, isLoaded } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		const checkExistingUser = async () => {
			if (!isLoaded || !isSignedIn) return;

			try {
				const response = await fetch(
					`http://localhost:5000/api/users/clerk/${user.id}`
				);

				if (response.ok) {
					const data = await response.json();
					if (data.exists) navigate("/people");
				}
			} catch (error) {
				console.error("Error checking user:", error);
			}
		};

		checkExistingUser();
	}, [isLoaded, isSignedIn, user, navigate]);

	const handleCompleteProfile = () => {
		navigate("/info");
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
			<div className="max-w-4xl mx-auto px-4 pt-20 text-center">
				<div className="mb-8 inline-block bg-purple-100/50 rounded-2xl p-4">
					<svg
						className="w-16 h-16 text-purple-600 mx-auto"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path
							fillRule="evenodd"
							d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
							clipRule="evenodd"
						/>
					</svg>
				</div>

				<h1 className="text-5xl font-bold text-purple-900 mb-6">
					CU now has See <span className="text-purple-600">You</span>
				</h1>

				<p className="text-lg text-purple-800/90 mb-8 max-w-2xl mx-auto">
					Connect with students who share your interests and values.
					Build meaningful relationships in your academic community.
				</p>

				{isSignedIn ? (
					<button
						onClick={handleCompleteProfile}
						className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg hover:from-purple-600 hover:to-purple-700"
					>
						Complete Your Profile →
					</button>
				) : (
					<div className="space-y-4">
						<p className="text-purple-700/90 mb-6">
							Sign in to start your journey
						</p>
						<SignInButton mode="modal">
							<button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold text-lg hover:from-purple-600 hover:to-purple-700">
								Begin Matching
							</button>
						</SignInButton>
					</div>
				)}
			</div>
		</div>
	);
};

export default Home;
