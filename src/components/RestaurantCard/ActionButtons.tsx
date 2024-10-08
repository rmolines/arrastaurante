import { FaTimes, FaBookmark } from "react-icons/fa";
import { RestaurantCardProps } from "../../types/restaurants";

const ActionButtons = ({ handleSwipe, restaurant }: RestaurantCardProps) => {
	return (
		<div className="flex justify-around p-4 bg-gray-200">
			<button
				onClick={() => handleSwipe("left", restaurant)}
				className="bg-red-500 text-white p-3 rounded-full border-4 border-black"
			>
				<FaTimes />
			</button>
			<button
				onClick={() => handleSwipe("right", restaurant)}
				className="bg-blue-500 text-white p-3 rounded-full border-4 border-black"
				// className="bg-green-500 text-white p-3 rounded-full border-4 border-black"
			>
				<FaBookmark />
			</button>
		</div>
	);
};

export default ActionButtons;
