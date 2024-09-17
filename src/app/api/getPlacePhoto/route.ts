import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const photoName = request.nextUrl.searchParams.get("photoName");

	if (!photoName) {
		return NextResponse.json(
			{ error: "Invalid photo name" },
			{ status: 400 }
		);
	}

	const url = `https://places.googleapis.com/v1/${photoName}/media?key=${process.env.GOOGLE_MAPS_API_KEY}&maxHeightPx=400`;

	try {
		const response = await fetch(url);
		const arrayBuffer = await response.arrayBuffer();

		return new NextResponse(arrayBuffer, {
			status: 200,
			headers: {
				"Content-Type": "image/jpeg",
			},
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch image" },
			{ status: 500 }
		);
	}
}
