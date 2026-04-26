export interface Template {
  id: string;
  name: string;
  description: string;
  category:
    | "classic"
    | "modern"
    | "minimal"
    | "creative"
    | "professional"
    | string;
  isPremium: boolean;
  rating: number;
  downloads: number;
  thumbnail: string;
  colors: string[];
  features: string[];
}
