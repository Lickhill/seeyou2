import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Info from "./pages/Info";
import People from "./pages/People";
import Layout from "./components/Layout";
import Matches from "./pages/Matches";

const App = () => {
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/info" element={<Info />} />
				<Route path="/people" element={<People />} />
				<Route path="/matches" element={<Matches />} />
			</Routes>
		</Layout>
	);
};

export default App;
