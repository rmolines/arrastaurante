import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Arrastaurante - Encontre os melhores restaurantes perto de você",
	description:
		"Descubra e avalie restaurantes próximos com Arrastaurante. Deslize para direita para curtir, para esquerda para passar. Encontre sua próxima refeição favorita!",
	openGraph: {
		title: "Arrastaurante - Encontre os melhores restaurantes perto de você",
		description:
			"Descubra e avalie restaurantes próximos com Arrastaurante. Deslize para direita para curtir, para esquerda para passar.",
		type: "website",
		url: "https://www.arrastaurante.com", // Replace with your actual URL
		images: [
			{
				url: "https://www.arrastaurante.com/og-image.jpg", // Replace with your actual OG image
				width: 1200,
				height: 630,
				alt: "Arrastaurante logo",
			},
		],
	},
};
