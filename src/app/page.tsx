"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Head from "next/head";
import { JsonLd } from "react-schemaorg";
import { Restaurant as SchemaRestaurant } from "schema-dts";
import RestaurantCard from "../components/RestaurantCard/RestaurantCard";
import dynamic from "next/dynamic";
import { fetchNearbyRestaurants } from "../utils/fetchRestaurants";
import { Restaurant } from "../types/restaurants";
import useLocalStorage from "../hooks/useLocalStorage";
import * as XLSX from "xlsx";
import { shuffleArray } from "../utils/arrayUtils";

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
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [priceFilter, setPriceFilter] = useState<number | null>(null); // Any price
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [distanceFilter, setDistanceFilter] = useState<number>(1); // 1 km
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [ratingFilter, setRatingFilter] = useState<number>(4); // 4 stars and above
	const [isLoading, setIsLoading] = useState<boolean>(false); // New loading state
	const [resetMessage, setResetMessage] = useState<string | null>(null); // Optional feedback
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [locationDisplay, setLocationDisplay] = useState<string>("");
	const [permissionDenied, setPermissionDenied] = useState<boolean>(false); // New state for permission

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

				// Shuffle the filtered restaurants
				const shuffled = shuffleArray(filtered);

				setRestaurants(shuffled);
				setCurrentRestaurantIndex(0); // Reset index
			} catch (error) {
				console.error("Error fetching restaurant data:", error);
				setError(
					"Erro ao buscar dados dos restaurantes. Por favor, tente novamente mais tarde."
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
				setError("Código postal inválido");
			}
		} catch (error) {
			setError("Erro ao buscar dados de localização");
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
							(err) => {
								if (err.code === err.PERMISSION_DENIED) {
									setPermissionDenied(true);
								}
								reject(err);
							},
							{
								enableHighAccuracy: true,
								timeout: 10000,
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
					"Unable to access geolocation. Please enter your postal code."
				);
				setError(
					"Não foi possível acessar sua localização. Por favor, insira seu código postal."
				);
				setPermissionDenied(true);
			}
		} else {
			console.warn(
				"Geolocation is not supported by your browser. Please enter your postal code."
			);
			setError(
				"Seu navegador não suporta geolocalização. Por favor, insira seu código postal."
			);
			setPermissionDenied(true);
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

	useEffect(() => {
		if (location) {
			// Update location display when location changes
			setLocationDisplay(
				`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
			);
		}
	}, [location]);

	const updateLocationDisplay = useCallback(async () => {
		if (location) {
			try {
				const response = await fetch(
					`/api/reverseGeocode?lat=${location.lat}&lng=${location.lng}`
				);
				if (!response.ok) {
					throw new Error("Failed to fetch location data");
				}
				const data = await response.json();
				setLocationDisplay(
					data.postalCode ||
						`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
				);
			} catch (error) {
				console.error("Error fetching location display:", error);
				setLocationDisplay(
					`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
				);
			}
		}
	}, [location]);

	useEffect(() => {
		updateLocationDisplay();
	}, [location, updateLocationDisplay]);

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
		setResetMessage("Todos os restaurantes foram reiniciados!");
		await loadRestaurants(); // Refetch restaurants
		setTimeout(() => setResetMessage(null), 3000); // Hide message after 3 seconds
	};

	const exportToExcel = () => {
		const worksheet = XLSX.utils.json_to_sheet(likedRestaurants);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(
			workbook,
			worksheet,
			"Restaurantes Gostados"
		);
		XLSX.writeFile(workbook, "restaurantes_gostados.xlsx");
	};

	return (
		<>
			<Head>
				<link
					href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<main className="flex flex-col min-h-screen bg-yellow-400 py-16">
				<header className="flex flex-col items-center justify-center w-full max-w-md mx-auto">
					<h1 className="text-4xl md:text-5xl font-bold mb-2 text-black font-pacifico">
						Arrastaurante
					</h1>
					<h2 className="text-xl mb-8 text-black text-center px-4">
						Descubra e salve seus restaurantes favoritos com um
						simples deslize
					</h2>
				</header>
				<section className="w-full md:w-1/3 lg:w-1/2 flex flex-col items-center justify-center mx-auto max-w-md">
					{permissionDenied ? (
						<div className="mb-4 w-full">
							<p className="mb-2 text-red-500 text-center">
								Permissão de geolocalização negada ou não
								disponível. Por favor, insira seu código postal.
							</p>
							<div className="flex items-center border-4 border-black rounded-lg overflow-hidden">
								<input
									type="text"
									value={postalCode}
									onChange={(e) =>
										setPostalCode(e.target.value)
									}
									placeholder="Insira o código postal"
									className="px-4 py-2 focus:outline-none flex-grow text-black"
								/>
								<button
									onClick={handlePostalCodeSearch}
									className="bg-black text-white px-4 py-2 hover:bg-gray-600 transition-colors font-bold"
								>
									Buscar
								</button>
							</div>
						</div>
					) : (
						!location && (
							<button
								onClick={getLocation}
								className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors font-bold"
							>
								Permitir Acesso à Localização
							</button>
						)
					)}
					{error && <p className="text-red-500 mb-4">{error}</p>}
					<div className="swipe-container flex flex-col items-center justify-center w-full max-w-md mx-auto">
						{isLoading ? (
							<p className="text-lg text-black italic">
								Carregando restaurantes...
							</p>
						) : restaurants.length > 0 && currentRestaurant ? (
							<>
								<RestaurantCard
									key={currentRestaurant.place_id}
									restaurant={currentRestaurant}
									handleSwipe={handleSwipe}
								/>
								<JsonLd<SchemaRestaurant>
									item={{
										"@context": "https://schema.org",
										"@type": "Restaurant",
										name: currentRestaurant.name,
										address: {
											"@type": "PostalAddress",
											streetAddress:
												currentRestaurant.vicinity,
										},
										aggregateRating: {
											"@type": "AggregateRating",
											ratingValue:
												currentRestaurant.rating,
											reviewCount:
												currentRestaurant.user_ratings_total,
										},
									}}
								/>
							</>
						) : (
							<p className="text-lg text-gray-600 italic">
								Não há mais restaurantes para exibir
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
				</section>
				<aside className="w-full md:w-1/3 lg:w-1/4">
					{/* Additional content or widgets can be added here */}
				</aside>
			</main>
		</>
	);
}
