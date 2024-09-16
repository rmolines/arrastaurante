/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "places.googleapis.com",
				port: "",
				pathname: "/v1/places/**",
			},
		],
	},
};

export default nextConfig;
