// src/components/Layout.jsx
import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<main className="flex-grow py-6">{children}</main>
		</div>
	);
};

export default Layout;
