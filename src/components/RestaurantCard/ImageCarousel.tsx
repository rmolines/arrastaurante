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
	const [fallbackToOriginal, setFallbackToOriginal] = useState(false);

	const nextImage = () => {
		setIsLoading(true);
		setImageError(false);
		setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
	};

	const prevImage = () => {
		setIsLoading(true);
		setImageError(false);
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + photos.length) % photos.length
		);
	};

	const getImageUrl = (photoName: string) => {
		if (photoName.startsWith("http")) {
			return photoName;
		}
		// Use URLSearchParams to properly handle the encoding
		const params = new URLSearchParams({ photoName });
		return `/api/getPlacePhoto?${params.toString()}`;
	};

	const imageUrl = getImageUrl(photos[currentIndex]?.name || "");

	const handleImageError = () => {
		setIsLoading(false);
		if (!fallbackToOriginal) {
			setFallbackToOriginal(true);
		} else {
			setImageError(true);
		}
	};

	return (
		<div className="relative h-48 border-b-4 border-black">
			{photos.length > 0 ? (
				<>
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
						</div>
					)}
					{!imageError ? (
						<Image
							src={
								fallbackToOriginal
									? photos[currentIndex]?.name
									: imageUrl
							}
							alt={`Restaurant image ${currentIndex + 1}`}
							fill
							sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
							style={{ objectFit: "cover" }}
							priority
							onLoad={() => setIsLoading(false)}
							onError={handleImageError}
						/>
					) : (
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
