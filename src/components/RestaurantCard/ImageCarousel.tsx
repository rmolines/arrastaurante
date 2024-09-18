import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Image from "next/image";

interface ImageCarouselProps {
	photos: { name: string }[];
}

const ImageCarousel = ({ photos }: ImageCarouselProps) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [imageError, setImageError] = useState(false);

	const nextImage = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
		setIsLoading(true);
		setImageError(false);
	};

	const prevImage = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + photos.length) % photos.length
		);
		setIsLoading(true);
		setImageError(false);
	};

	const getImageUrl = (photoName: string) => {
		if (photoName.startsWith("http")) {
			return photoName;
		}
		return `/api/getPlacePhoto?photoName=${encodeURIComponent(photoName)}`;
	};

	const imageUrl = getImageUrl(photos[currentIndex]?.name || "");

	return (
		<div className="relative h-48 border-b-4 border-black">
			{photos.length > 0 ? (
				<>
					{isLoading && !imageError && (
						<div className="absolute inset-0 flex items-center justify-center bg-gray-200">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
						</div>
					)}
					<Image
						src={imageUrl}
						alt={`Restaurant image ${currentIndex + 1}`}
						layout="fill"
						objectFit="cover"
						onLoadingComplete={() => setIsLoading(false)}
						onError={() => {
							setIsLoading(false);
							setImageError(true);
						}}
					/>
					{imageError && (
						<div className="absolute inset-0 flex items-center justify-center bg-gray-200">
							<p className="text-gray-500">
								Failed to load image
							</p>
						</div>
					)}
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
