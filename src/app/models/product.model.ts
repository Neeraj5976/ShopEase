export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: string;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  features?: string[];
}

export interface ProductCategory {
  id: number;
  name: string;
  imageUrl: string;
}
