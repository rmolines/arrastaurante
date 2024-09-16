import { FaDollarSign } from "react-icons/fa";

interface PriceLevelProps {
	level?: string;
}

const PriceLevel = ({ level }: PriceLevelProps) => {
	const getPriceLevel = (level: string | undefined) => {
		switch (level) {
			case "PRICE_LEVEL_FREE":
				return 0;
			case "PRICE_LEVEL_INEXPENSIVE":
				return 1;
			case "PRICE_LEVEL_MODERATE":
				return 2;
			case "PRICE_LEVEL_EXPENSIVE":
				return 3;
			case "PRICE_LEVEL_VERY_EXPENSIVE":
				return 4;
			default:
				return 0;
		}
	};

	const numericLevel = getPriceLevel(level);

	return (
		<div className="flex items-center mt-1">
			{[...Array(4)].map((_, i) => (
				<FaDollarSign
					key={i}
					className={
						i < numericLevel ? "text-green-500" : "text-gray-300"
					}
				/>
			))}
		</div>
	);
};

export default PriceLevel;
