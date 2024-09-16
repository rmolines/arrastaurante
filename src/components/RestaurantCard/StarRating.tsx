import { FaStar } from "react-icons/fa";

interface StarRatingProps {
	rating: number | null | undefined;
}

const StarRating = ({ rating }: StarRatingProps) => {
	const displayRating = rating ?? 0;

	return (
		<div className="flex items-center">
			{[...Array(5)].map((_, i) => (
				<FaStar
					key={i}
					className={
						i < Math.floor(displayRating)
							? "text-yellow-400"
							: "text-gray-300"
					}
				/>
			))}
			<span className="ml-2 text-gray-600">
				{displayRating.toFixed(1)}
			</span>
		</div>
	);
};

export default StarRating;
