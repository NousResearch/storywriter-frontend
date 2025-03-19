import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	compiler: {
		styledComponents: true
	},
	output: "export",
};

export default nextConfig;
