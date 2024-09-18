interface IpBasedLocation {
	latitude: number;
	longitude: number;
}

export async function fetchIpBasedLocation(): Promise<IpBasedLocation> {
	const response = await fetch("https://ipapi.co/json/");
	if (!response.ok) {
		throw new Error("Failed to fetch IP-based location");
	}
	const data = await response.json();
	return {
		latitude: data.latitude,
		longitude: data.longitude,
	};
}
