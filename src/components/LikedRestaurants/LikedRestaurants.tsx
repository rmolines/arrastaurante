import { useState, useEffect } from "react";
import { Restaurant } from "@/types/restaurants";
import RestaurantCard from "../RestaurantCard/RestaurantCard";

interface LikedRestaurantsProps {
	likedRestaurants: Restaurant[];
	clearLikedRestaurants: () => void;
	exportToExcel: () => void; // Add this line
}

const LikedRestaurants = ({
	likedRestaurants,
	clearLikedRestaurants,
	exportToExcel, // Add this line
}: LikedRestaurantsProps) => {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null; // or a loading placeholder
	}

	const restaurantsArray = Array.isArray(likedRestaurants)
		? likedRestaurants
		: [];

	return (
		<div className="rounded-lg max-w-md">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-2xl font-bold text-gray-600">
					Liked Restaurants
				</h2>
				<div className="flex space-x-2">
					{" "}
					{/* Change to flex and add space-x-2 */}
					<button
						onClick={exportToExcel}
						className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
					>
						Export
					</button>
					<button
						onClick={clearLikedRestaurants}
						className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
					>
						Reset
					</button>
				</div>
			</div>
			{restaurantsArray.length === 0 ? (
				<p className="text-gray-600">No liked restaurants yet.</p>
			) : (
				<ul className="space-y-4">
					{restaurantsArray.map((restaurant) => (
						<li key={restaurant.place_id}>
							<RestaurantCard
								restaurant={restaurant}
								compact={true}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default LikedRestaurants;
