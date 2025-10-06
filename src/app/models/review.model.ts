export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: Date;
  verified: boolean;
}

export interface ReviewRequest {
  productId: number;
  rating: number;
  title: string;
  comment: string;
}
