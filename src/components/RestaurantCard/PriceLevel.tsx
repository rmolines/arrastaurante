import { FaDollarSign } from "react-icons/fa";

interface PriceLevelProps {
	level: number;
}

const PriceLevel = ({ level }: PriceLevelProps) => {
	return (
		<div className="flex items-center mt-1">
			{[...Array(4)].map((_, i) => (
				<FaDollarSign
					key={i}
					className={i < level ? "text-green-500" : "text-gray-300"}
				/>
			))}
		</div>
	);
};

export default PriceLevel;
