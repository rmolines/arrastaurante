export interface Photo {
	height: number;
	html_attributions: string[];
	photo_reference: string;
	width: number;
}

export interface OpeningHours {
	open_now?: boolean;
	weekday_text?: string[];
}

export interface Review {
	author_name: string;
	rating: number;
	text: string;
}

interface GooglePhoto {
	name: string;
	widthPx: number;
	heightPx: number;
}

export interface Restaurant {
	place_id: string;
	name: string;
	address: string;
	rating: number;
	price_level: number;
	types: string[];
	primary_type_display_name: string;
	opening_hours?: {
		openNow?: boolean;
		periods?: Array<{
			open: { day: number; hour: number; minute: number };
			close?: { day: number; hour: number; minute: number };
		}>;
		weekdayDescriptions?: string[];
	};
	photos: Array<{
		name: string;
		widthPx: number;
		heightPx: number;
	}>;
	website: string;
	reviews: Array<{
		name: string;
		relativePublishTimeDescription: string;
		rating: number;
		text: { text: string };
	}>;
	latitude?: number;
	longitude?: number;
	distance?: number; // Distance in meters
}

export interface RestaurantCardProps {
	restaurant: Restaurant;
	handleSwipe: (direction: string, restaurant: Restaurant) => void;
}

export interface GooglePlace {
	place_id: string;
	name: string;
	vicinity?: string;
	geometry?: {
		location: {
			lat: number;
			lng: number;
		};
	};
	rating?: number;
	price_level?: number;
	types?: string[];
	opening_hours?: OpeningHours;
	photos?: Photo[];
	website?: string;
	reviews?: Review[]; // Note: Nearby Search doesn't return reviews
}
