// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import { useEffect, useState } from "react";
import RestaurantCard from "../components/RestaurantCard/RestaurantCard";
import LikedRestaurants from "../components/LikedRestaurants/LikedRestaurants";
import { fetchNearbyRestaurants } from "../utils/fetchRestaurants";
import { Restaurant } from "../types/restaurants";
import useLocalStorage from "../hooks/useLocalStorage";

export default function Home() {
	const [location, setLocation] = useState<{
		lat: number;
		lng: number;
	}>({ lat: 40.7128, lng: -74.006 }); // Default to New York City
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
	const [likedRestaurants, setLikedRestaurants] = useLocalStorage<
		Restaurant[]
	>("likedRestaurants", []);
	const [postalCode, setPostalCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [priceFilter, setPriceFilter] = useState<number | null>(null); // Any price
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [distanceFilter, setDistanceFilter] = useState<number>(1); // 5 km
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [ratingFilter, setRatingFilter] = useState<number>(4); // 4 stars and above

	const handlePostalCodeSearch = async () => {
		setError(null);
		try {
			const response = await fetch(
				`/api/geocode?postalCode=${postalCode}`
			);
			if (!response.ok) {
				throw new Error("Failed to fetch location data");
			}
			const data = await response.json();
			if (data.lat && data.lng) {
				setLocation({ lat: data.lat, lng: data.lng });
			} else {
				setError("Invalid postal code");
			}
		} catch (error) {
			setError("Error fetching location data");
		}
	};

	const getLocation = () => {
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setLocation({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
				},
				() => {
					console.warn(
						"Unable to access location. Using default location."
					);
					// Fallback to default location (already set in initial state)
				},
				{ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
			);
		} else {
			console.warn(
				"Geolocation is not supported by your browser. Using default location."
			);
			// Default location is already set in initial state
		}
	};

	useEffect(() => {
		getLocation();
	}, []);

	useEffect(() => {
		fetchNearbyRestaurants(
			location.lat,
			location.lng,
			priceFilter,
			distanceFilter,
			ratingFilter
		)
			.then((data) => setRestaurants(data))
			.catch((error) => {
				console.error("Error fetching restaurant data:", error);
				// You might want to show a non-blocking notification to the user here
			});
	}, [location, priceFilter, distanceFilter, ratingFilter]);

	const handleSwipe = (direction: string, restaurant: Restaurant) => {
		if (direction === "right") {
			setLikedRestaurants((prev) => [...prev, restaurant]);
		}
		setCurrentRestaurantIndex((prevIndex) => prevIndex + 1);
	};

	const currentRestaurant = restaurants[currentRestaurantIndex];

	const clearLikedRestaurants = () => {
		setLikedRestaurants([]);
	};

	return (
		<main className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-blue-100 to-white">
			<div className="hidden md:block md:w-1/3"></div>
			<div className="w-full lg:w-1/3 flex flex-col items-center p-4">
				<div className="mb-4 flex items-center">
					<input
						type="text"
						value={postalCode}
						onChange={(e) => setPostalCode(e.target.value)}
						placeholder="Enter postal code"
						className="border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						onClick={handlePostalCodeSearch}
						className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
					>
						Search
					</button>
				</div>
				{error && <p className="text-red-500 mb-4">{error}</p>}
				<div className="swipe-container flex flex-col items-center justify-center w-full max-w-md mx-auto">
					{currentRestaurant ? (
						<RestaurantCard
							key={currentRestaurant.place_id}
							restaurant={currentRestaurant}
							handleSwipe={handleSwipe}
						/>
					) : (
						<p className="text-lg text-gray-600 italic">
							{restaurants.length > 0
								? "No more restaurants to show"
								: "Loading restaurants..."}
						</p>
					)}
				</div>
			</div>
			<div className="w-full lg:w-1/3 p-4">
				<div className="rounded-lg max-h-[50vh] md:max-h-[calc(100vh-2rem)] overflow-y-auto">
					<LikedRestaurants
						likedRestaurants={likedRestaurants}
						clearLikedRestaurants={clearLikedRestaurants}
					/>
				</div>
			</div>
		</main>
	);
}
