import {
	FaThumbsUp,
	FaThumbsDown,
	FaClock as FaMaybeLater,
} from "react-icons/fa";
import { RestaurantCardProps } from "../../types/restaurants";

const ActionButtons = ({ handleSwipe, restaurant }: RestaurantCardProps) => {
	return (
		<div className="flex justify-around p-4 bg-gray-200">
			<button
				onClick={() => handleSwipe("left", restaurant)}
				className="bg-red-500 text-white p-3 rounded-full"
			>
				<FaThumbsDown />
			</button>
			<button
				onClick={() => handleSwipe("up", restaurant)}
				className="bg-yellow-500 text-white p-3 rounded-full"
			>
				<FaMaybeLater />
			</button>
			<button
				onClick={() => handleSwipe("right", restaurant)}
				className="bg-green-500 text-white p-3 rounded-full"
			>
				<FaThumbsUp />
			</button>
		</div>
	);
};

export default ActionButtons;
