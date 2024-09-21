import React from "react";
import { Restaurant } from "@/types/restaurants";
import { FaDirections, FaGlobe, FaPhone, FaUtensils } from "react-icons/fa";

const RestaurantDetails: React.FC<{
	restaurant: Restaurant;
	compact?: boolean;
}> = ({ restaurant, compact = false }) => {
	const getDirectionsUrl = () => {
		if (restaurant.latitude && restaurant.longitude) {
			return `https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`;
		}
		return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
			restaurant.address
		)}`;
	};

	if (compact) {
		return (
			<div className="restaurant-details-compact text-xs text-gray-600">
				<span>{restaurant.primary_type_display_name}</span>
				{restaurant.distance && (
					<span className="ml-1">
						• {(restaurant.distance / 1000).toFixed(1)}km
					</span>
				)}
			</div>
		);
	}

	return (
		<div
			className={`restaurant-details p-4 bg-gray-100 rounded-lg shadow-md ${
				compact ? "text-sm" : ""
			}`}
		>
			{!compact && (
				<p className="text-gray-600 font-semibold mb-2 h-12 overflow-hidden text-ellipsis">
					{restaurant.address}
				</p>
			)}
			<div className="flex items-center mb-2">
				<FaUtensils className="text-orange-500 mr-1" />
				<span className="text-gray-700 font-semibold">
					{restaurant.primary_type_display_name}
				</span>
				{compact && restaurant.distance && (
					<span className="text-gray-500 font-medium ml-2">
						• {(restaurant.distance / 1000).toFixed(2)} km
					</span>
				)}
			</div>

			{!compact && restaurant.website && (
				<div className="flex items-center mb-2">
					<FaGlobe className="text-blue-500 mr-1" />
					<a
						href={restaurant.website}
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-600 hover:underline font-semibold"
					>
						Visit Website
					</a>
				</div>
			)}

			{!compact && restaurant.distance && (
				<div className="flex items-center text-blue-500 font-semibold">
					<FaDirections className="mr-1" />
					<a
						href={getDirectionsUrl()}
						target="_blank"
						rel="noopener noreferrer"
					>
						<p className="text-sm">
							{(restaurant.distance / 1000).toFixed(2)} km away
						</p>
					</a>
				</div>
			)}
		</div>
	);
};

export default RestaurantDetails;
