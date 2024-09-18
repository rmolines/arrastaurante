// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

"use client";

import Head from "next/head";
import { useEffect, useState, useCallback, useRef } from "react";
import RestaurantCard from "../components/RestaurantCard/RestaurantCard";
import dynamic from "next/dynamic";
import { fetchNearbyRestaurants } from "../utils/fetchRestaurants";
import { Restaurant } from "../types/restaurants";
import useLocalStorage from "../hooks/useLocalStorage";
import * as XLSX from "xlsx";
import { fetchIpBasedLocation } from "../utils/fetchIpBasedLocation";
import { shuffleArray } from "../utils/arrayUtils"; // Import shuffleArray

const LikedRestaurants = dynamic(
	() => import("../components/LikedRestaurants/LikedRestaurants"),
	{
		ssr: false,
	}
);

export default function Home() {
	const [location, setLocation] = useState<{
		lat: number;
		lng: number;
	} | null>(null);
	const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
	const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
	const [likedRestaurants, setLikedRestaurants] = useLocalStorage<
		Restaurant[]
	>("likedRestaurants", []);
	const [dislikedRestaurants, setDislikedRestaurants] = useLocalStorage<
		Restaurant[]
	>("dislikedRestaurants", []);
	const [postalCode, setPostalCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [priceFilter, setPriceFilter] = useState<number | null>(null); // Any price
	const [distanceFilter, setDistanceFilter] = useState<number>(1); // 1 km
	const [ratingFilter, setRatingFilter] = useState<number>(4); // 4 stars and above
	const [isLoading, setIsLoading] = useState<boolean>(false); // New loading state
	const [resetMessage, setResetMessage] = useState<string | null>(null); // Optional feedback

	// References to hold the latest liked and disliked restaurants
	const likedRestaurantsRef = useRef(likedRestaurants);
	const dislikedRestaurantsRef = useRef(dislikedRestaurants);

	// Update refs whenever liked or disliked restaurants change
	useEffect(() => {
		likedRestaurantsRef.current = likedRestaurants;
	}, [likedRestaurants]);

	useEffect(() => {
		dislikedRestaurantsRef.current = dislikedRestaurants;
	}, [dislikedRestaurants]);

	// Extracted fetching logic
	const loadRestaurants = useCallback(async () => {
		if (location) {
			setIsLoading(true);
			setError(null);
			try {
				const data = await fetchNearbyRestaurants(
					location.lat,
					location.lng,
					priceFilter,
					distanceFilter,
					ratingFilter
				);
				console.log("Fetched Restaurants:", data); // Debugging
				console.log("Liked Restaurants:", likedRestaurantsRef.current); // Debugging liked restaurants
				console.log(
					"Disliked Restaurants:",
					dislikedRestaurantsRef.current
				); // Debugging disliked restaurants

				// Exclude liked and disliked restaurants using refs
				const filtered = data.filter(
					(restaurant) =>
						!likedRestaurantsRef.current.some(
							(liked) => liked.place_id === restaurant.place_id
						) &&
						!dislikedRestaurantsRef.current.some(
							(disliked) =>
								disliked.place_id === restaurant.place_id
						)
				);
				console.log("Filtered Restaurants:", filtered); // Debugging

				// Shuffle the filtered restaurants
				const shuffled = shuffleArray(filtered);
				console.log("Shuffled Restaurants:", shuffled); // Debugging

				setRestaurants(shuffled);
				setCurrentRestaurantIndex(0); // Reset index
			} catch (error) {
				console.error("Error fetching restaurant data:", error);
				setError(
					"Error fetching restaurant data. Please try again later."
				);
			} finally {
				setIsLoading(false);
			}
		}
	}, [
		location,
		priceFilter,
		distanceFilter,
		ratingFilter,
		// Removed likedRestaurants and dislikedRestaurants from dependencies
	]);

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

	const getLocation = async () => {
		console.log("Attempting to get user location...");
		if ("geolocation" in navigator) {
			try {
				const position = await new Promise<GeolocationPosition>(
					(resolve, reject) => {
						navigator.geolocation.getCurrentPosition(
							resolve,
							reject,
							{
								enableHighAccuracy: true,
								timeout: 5000,
								maximumAge: 0,
							}
						);
					}
				);

				setLocation({
					lat: position.coords.latitude,
					lng: position.coords.longitude,
				});
			} catch (error) {
				console.warn(
					"Unable to access geolocation. Falling back to IP-based location."
				);
				await fallbackToIpBasedLocation();
			}
		} else {
			console.warn(
				"Geolocation is not supported by your browser. Falling back to IP-based location."
			);
			await fallbackToIpBasedLocation();
		}
	};

	const fallbackToIpBasedLocation = async () => {
		try {
			const ipBasedLocation = await fetchIpBasedLocation();
			setLocation({
				lat: ipBasedLocation.latitude,
				lng: ipBasedLocation.longitude,
			});
		} catch (error) {
			console.error("Error fetching IP-based location:", error);
			setError(
				"Unable to determine your location. Please enter a postal code."
			);
		}
	};

	useEffect(() => {
		if (location) {
			loadRestaurants();
		}
	}, [location, loadRestaurants]); // Dependencies only include location and loadRestaurants

	useEffect(() => {
		console.log("Initializing location...");
		getLocation();
	}, []);

	const handleSwipe = (direction: string, restaurant: Restaurant) => {
		console.log(`Swiping ${direction} on restaurant: ${restaurant.name}`);
		if (direction === "right") {
			setLikedRestaurants((prev) => [...prev, restaurant]);
		} else if (direction === "left") {
			setDislikedRestaurants((prev) => [...prev, restaurant]);
		}
		// Remove the swiped restaurant from the current list without triggering a re-fetch
		setRestaurants((prev) =>
			prev.filter((r) => r.place_id !== restaurant.place_id)
		);
		setCurrentRestaurantIndex((prevIndex) => prevIndex + 1);
	};

	const currentRestaurant = restaurants[currentRestaurantIndex];

	// Updated function to reset both liked and disliked restaurants and refetch
	const resetAllRestaurants = async () => {
		setLikedRestaurants([]);
		setDislikedRestaurants([]);
		setResetMessage("All restaurants have been reset!");
		await loadRestaurants(); // Refetch restaurants
		setTimeout(() => setResetMessage(null), 3000); // Hide message after 3 seconds
	};

	const exportToExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(likedRestaurants);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Liked Restaurants");
		XLSX.writeFile(workbook, "liked_restaurants.xlsx");
	};

	return (
		<>
			<Head>
				<link
					href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<main className="flex flex-col md:flex-row min-h-screen bg-yellow-400">
				<div className="w-full md:w-1/3 lg:w-1/4"></div>
				<div className="w-full md:w-1/3 lg:w-1/2 flex flex-col items-center">
					<h1 className="text-4xl md:text-5xl font-bold mb-8 mt-4 text-black font-pacifico">
						Arrastaurante
					</h1>
					<div className="mb-4 flex items-center border-4 border-black rounded-lg overflow-hidden">
						<input
							type="text"
							value={postalCode}
							onChange={(e) => setPostalCode(e.target.value)}
							placeholder="Enter postal code"
							className="px-4 py-2 focus:outline-none flex-grow text-black"
						/>
						<button
							onClick={handlePostalCodeSearch}
							className="bg-black text-white px-4 py-2 hover:bg-gray-600 transition-colors font-bold"
						>
							Search
						</button>
					</div>
					{error && <p className="text-red-500 mb-4">{error}</p>}
					<div className="swipe-container flex flex-col items-center justify-center w-full max-w-md mx-auto">
						{isLoading ? (
							<p className="text-lg text-black italic">
								Loading restaurants...
							</p>
						) : restaurants.length > 0 && currentRestaurant ? (
							<RestaurantCard
								key={currentRestaurant.place_id}
								restaurant={currentRestaurant}
								handleSwipe={handleSwipe}
							/>
						) : (
							<p className="text-lg text-gray-600 italic">
								No more restaurants to show
							</p>
						)}
					</div>
					<div className="w-full max-w-md mt-8 mb-16">
						{resetMessage && (
							<div className="mb-4 p-3 bg-blue-500 text-white rounded-lg">
								{resetMessage}
							</div>
						)}
						<LikedRestaurants
							likedRestaurants={likedRestaurants}
							clearAllRestaurants={resetAllRestaurants} // Pass the reset function
							exportToExcel={exportToExcel}
						/>
						{/* Add a component or button to manage disliked restaurants if needed */}
					</div>
				</div>
				<div className="w-full md:w-1/3 lg:w-1/4"></div>
			</main>
		</>
	);
}
