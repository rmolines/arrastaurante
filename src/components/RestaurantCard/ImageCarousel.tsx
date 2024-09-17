import { useState } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ImageCarouselProps {
	photos: { name: string }[];
}

const ImageCarousel = ({ photos }: ImageCarouselProps) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextImage = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
	};

	const prevImage = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + photos.length) % photos.length
		);
	};

	return (
		<div className="relative h-48">
			{photos.length > 0 ? (
				<>
					<Image
						src={`/api/getPlacePhoto?photoName=${encodeURIComponent(
							photos[currentIndex].name
						)}`}
						alt={`Restaurant image ${currentIndex + 1}`}
						fill
						style={{ objectFit: "cover" }}
					/>
					{photos.length > 1 && (
						<>
							<button
								onClick={prevImage}
								className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2"
							>
								<FaChevronLeft />
							</button>
							<button
								onClick={nextImage}
								className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2"
							>
								<FaChevronRight />
							</button>
						</>
					)}
				</>
			) : (
				<div className="w-full h-full flex items-center justify-center bg-gray-200">
					<p className="text-gray-500">No image available</p>
				</div>
			)}
		</div>
	);
};

export default ImageCarousel;
