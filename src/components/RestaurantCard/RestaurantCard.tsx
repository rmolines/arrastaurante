import TinderCard from "react-tinder-card";
import { Restaurant } from "@/types/restaurants";
import StarRating from "./StarRating";
import PriceLevel from "./PriceLevel";
import ImageCarousel from "./ImageCarousel";
import RestaurantDetails from "./RestaurantDetails";
import ActionButtons from "./ActionButtons";

interface RestaurantCardProps {
	restaurant: Restaurant;
	handleSwipe?: (direction: string, restaurant: Restaurant) => void;
	compact?: boolean;
	// ... other props
}

export function RestaurantCard({
	restaurant,
	handleSwipe,
	compact = false,
}: RestaurantCardProps) {
	if (compact) {
		return (
			<div className="card bg-white shadow-lg rounded-xl overflow-hidden flex flex-row w-full h-32">
				<div className="w-1/3 h-full">
					<ImageCarousel photos={restaurant.photos || []} />
				</div>
				<div className="w-2/3 p-3 flex flex-col justify-between">
					<div>
						<h3 className="text-lg font-semibold mb-1 text-gray-800">
							{restaurant.name}
						</h3>
						<div className="flex items-center justify-between mb-1">
							<StarRating
								rating={restaurant.rating ?? undefined}
							/>
							<PriceLevel
								level={restaurant.price_level?.toString()}
							/>
						</div>
					</div>
					<RestaurantDetails restaurant={restaurant} compact={true} />
				</div>
			</div>
		);
	}

	return (
		<TinderCard
			className="swipe"
			key={restaurant.place_id}
			onSwipe={(dir) => handleSwipe?.(dir, restaurant)}
		>
			<div className="card bg-white w-80 max-w-full shadow-lg rounded-xl overflow-hidden">
				<ImageCarousel photos={restaurant.photos || []} />
				<div className="p-4">
					<h3 className="text-2xl font-bold mb-2 text-gray-800">
						{restaurant.name}
					</h3>
					<StarRating rating={restaurant.rating ?? undefined} />
					<PriceLevel level={restaurant.price_level?.toString()} />
				</div>
				<RestaurantDetails restaurant={restaurant} compact={false} />
				<ActionButtons
					handleSwipe={handleSwipe}
					restaurant={restaurant}
				/>
			</div>
		</TinderCard>
	);
}

export default RestaurantCard;
