import { Restaurant } from "@/types/restaurants";
import RestaurantCard from "../RestaurantCard/RestaurantCard";

interface LikedRestaurantsProps {
	likedRestaurants: Restaurant[];
}

const LikedRestaurants = ({ likedRestaurants }: LikedRestaurantsProps) => {
	// Shuffle the likedRestaurants array
	const shuffledRestaurants = [...likedRestaurants].sort(
		() => Math.random() - 0.5
	);

	return (
		<div className="rounded-lg max-w-md">
			<h2 className="text-2xl font-bold mb-4 text-gray-600">
				Liked Restaurants
			</h2>
			{likedRestaurants.length === 0 ? (
				<p className="text-gray-600">No liked restaurants yet.</p>
			) : (
				<ul className="space-y-4">
					{shuffledRestaurants.map((restaurant) => (
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
