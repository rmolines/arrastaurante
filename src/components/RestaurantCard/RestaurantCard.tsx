import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
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
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-30, 30]);
	const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

	if (compact) {
		return (
			<div className="card bg-white shadow-lg rounded-xl overflow-hidden flex flex-row w-full h-32 border-4 border-black">
				<div className="w-1/3 h-full border-r-4 border-black">
					<ImageCarousel photos={restaurant.photos || []} />
				</div>
				<div className="w-2/3 p-3 flex flex-col justify-between">
					<div>
						<h3 className="text-lg font-semibold mb-1 text-gray-800 truncate">
							{restaurant.name}
						</h3>
						<div className="flex flex-col mb-1">
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

	const handleDragEnd = (
		event: MouseEvent | TouchEvent | PointerEvent,
		info: PanInfo
	) => {
		if (info.offset.x > 100) {
			handleSwipe?.("right", restaurant);
		} else if (info.offset.x < -100) {
			handleSwipe?.("left", restaurant);
		}
	};

	return (
		<motion.div
			className="swipe"
			drag="x"
			dragConstraints={{ left: 0, right: 0 }}
			style={{ x, rotate, opacity }}
			onDragEnd={handleDragEnd}
		>
			<div className="card bg-white w-80 max-w-full shadow-lg rounded-xl overflow-hidden border-4 border-black">
				<ImageCarousel photos={restaurant.photos || []} />
				<div className="p-4">
					<h3 className="text-2xl font-bold mb-2 text-gray-800 truncate">
						{restaurant.name}
					</h3>
					<StarRating rating={restaurant.rating ?? undefined} />
					<PriceLevel level={restaurant.price_level?.toString()} />
				</div>
				<div className="border-t-4 border-black">
					<RestaurantDetails
						restaurant={restaurant}
						compact={false}
					/>
				</div>
				<div className="border-t-4 border-black">
					<ActionButtons
						handleSwipe={(direction) =>
							handleSwipe?.(direction, restaurant)
						}
						restaurant={restaurant}
					/>
				</div>
			</div>
		</motion.div>
	);
}

export default RestaurantCard;
