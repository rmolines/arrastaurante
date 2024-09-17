import { useState, useEffect } from "react";
import { Restaurant } from "@/types/restaurants";
import RestaurantCard from "../RestaurantCard/RestaurantCard";

interface LikedRestaurantsProps {
	likedRestaurants: Restaurant[];
	clearLikedRestaurants: () => void;
}

const LikedRestaurants = ({
	likedRestaurants,
	clearLikedRestaurants,
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
				<button
					onClick={clearLikedRestaurants}
					className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
				>
					Reset List
				</button>
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
