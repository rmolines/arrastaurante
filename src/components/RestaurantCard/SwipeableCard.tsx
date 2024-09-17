import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Restaurant } from "../../types/restaurants";
import { StarIcon, MapPinIcon } from "@heroicons/react/24/solid";

interface SwipeableCardProps {
	restaurant: Restaurant;
	onSwipe: (direction: "left" | "right", restaurant: Restaurant) => void;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
	restaurant,
	onSwipe,
}) => {
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-150, 0, 150], [-30, 0, 30]);
	const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);

	const handleDragEnd = (event: any, info: any) => {
		if (info.offset.x < -100) {
			onSwipe("left", restaurant);
		} else if (info.offset.x > 100) {
			onSwipe("right", restaurant);
		}
	};

	return (
		<motion.div
			drag="x"
			dragConstraints={{ left: 0, right: 0 }}
			onDragEnd={handleDragEnd}
			style={{ x, rotate, opacity }}
			className="w-full bg-white rounded-lg shadow-md overflow-hidden"
		>
			<img
				src={restaurant.photo}
				alt={restaurant.name}
				className="w-full h-48 object-cover"
			/>
			<div className="p-4">
				<h2 className="text-xl font-bold mb-2">{restaurant.name}</h2>
				<div className="flex items-center mb-2">
					<StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
					<span className="text-gray-600">
						{restaurant.rating} ({restaurant.user_ratings_total}{" "}
						reviews)
					</span>
				</div>
				<div className="flex items-center">
					<MapPinIcon className="h-5 w-5 text-gray-400 mr-1" />
					<span className="text-gray-600">{restaurant.vicinity}</span>
				</div>
			</div>
		</motion.div>
	);
};
