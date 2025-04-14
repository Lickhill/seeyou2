// src/AuthButtons.jsx
import React from "react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";

const AuthButtons = () => {
	return (
		<div>
			<SignInButton mode="modal" afterSignInUrl="/info" />
			<SignUpButton mode="modal" afterSignUpUrl="/info" />
		</div>
	);
};

export default AuthButtons;
