import React from "react";
import { Restaurant } from "@/types/restaurants";
import { FaGlobe, FaPhone, FaUtensils } from "react-icons/fa";

const RestaurantDetails: React.FC<{
	restaurant: Restaurant;
	compact?: boolean;
}> = ({ restaurant, compact = false }) => {
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
				<p className="text-gray-600 mb-2">{restaurant.address}</p>
			)}
			<div className="flex items-center mb-2">
				<FaUtensils className="text-orange-500 mr-1" />
				<span className="text-gray-700">
					{restaurant.primary_type_display_name}
				</span>
				{compact && restaurant.distance && (
					<span className="text-gray-500 ml-2">
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
						className="text-blue-600 hover:underline"
					>
						Visit Website
					</a>
				</div>
			)}

			{!compact && restaurant.distance && (
				<p className="text-sm text-gray-500">
					{(restaurant.distance / 1000).toFixed(2)} km away
				</p>
			)}
			{!compact && restaurant.phoneNumber && (
				<div className="flex items-center">
					<FaPhone className="text-gray-700 mr-1" />
					<span className="text-gray-700">
						{restaurant.phoneNumber}
					</span>
				</div>
			)}
		</div>
	);
};

export default RestaurantDetails;
