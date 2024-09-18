import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const photoReference = request.nextUrl.searchParams.get("photoName");

	if (!photoReference) {
		return NextResponse.json(
			{ error: "Invalid photo reference" },
			{ status: 400 }
		);
	}

	const apiKey = process.env.GOOGLE_MAPS_API_KEY;
	const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch image: ${response.statusText}`);
		}

		const imageBuffer = await response.arrayBuffer();
		const headers = new Headers(response.headers);
		headers.set("Cache-Control", "public, max-age=300");

		return new NextResponse(imageBuffer, {
			status: 200,
			headers: headers,
		});
	} catch (error) {
		console.error("Failed to fetch image:", error);
		return NextResponse.json(
			{ error: "Failed to fetch image" },
			{ status: 500 }
		);
	}
}
