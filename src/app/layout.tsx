import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "Arrastaurante - Encontre os melhores restaurantes perto de você",
	description:
		"Descubra e avalie restaurantes próximos com Arrastaurante. Deslize para direita para curtir, para esquerda para passar. Encontre sua próxima refeição favorita!",
	openGraph: {
		title: "Arrastaurante - Encontre os melhores restaurantes perto de você",
		description:
			"Descubra e avalie restaurantes próximos com Arrastaurante. Deslize para direita para curtir, para esquerda para passar.",
		type: "website",
		url: "https://arrastaurante.vercel.app/", // Replace with your actual URL
		images: [
			{
				url: "/images/arrastaurante-logo.png", // Replace with your actual OG image
				width: 1200,
				height: 630,
				alt: "Arrastaurante logo",
			},
		],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
