import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Review, ReviewRequest } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private reviewsSubject = new BehaviorSubject<Review[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  private readonly REVIEWS_KEY = 'shopease_reviews';

  constructor() {
    this.clearDummyReviews();
    this.loadReviews();
  }

  private clearDummyReviews(): void {
    // Clear any existing dummy reviews
    localStorage.removeItem(this.REVIEWS_KEY);
  }

  private loadReviews(): void {
    const savedReviews = localStorage.getItem(this.REVIEWS_KEY);
    if (savedReviews) {
      const reviews = JSON.parse(savedReviews);
      this.reviewsSubject.next(reviews);
    } else {
      // Initialize with some sample reviews
      this.initializeSampleReviews();
    }
  }

  private initializeSampleReviews(): void {
    // Initialize with empty reviews array
    const emptyReviews: Review[] = [];
    this.reviewsSubject.next(emptyReviews);
    this.saveReviews(emptyReviews);
  }

  private saveReviews(reviews: Review[]): void {
    localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(reviews));
    this.reviewsSubject.next(reviews);
  }

  private generateReviewId(): number {
    const reviews = this.reviewsSubject.value;
    return reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1;
  }

  getReviewsForProduct(productId: number): Observable<Review[]> {
    const reviews = this.reviewsSubject.value;
    const productReviews = reviews.filter(review => review.productId === productId);
    return of(productReviews);
  }

  addReview(reviewRequest: ReviewRequest, userId: number, userName: string): Observable<Review> {
    const reviews = this.reviewsSubject.value;
    
    // Allow multiple reviews from the same user for the same product
    const newReview: Review = {
      id: this.generateReviewId(),
      productId: reviewRequest.productId,
      userId: userId,
      userName: userName,
      rating: reviewRequest.rating,
      title: reviewRequest.title,
      comment: reviewRequest.comment,
      date: new Date(),
      verified: true // In real app, this would be based on purchase history
    };

    const updatedReviews = [...reviews, newReview];
    this.saveReviews(updatedReviews);

    return of(newReview);
  }

  updateReview(reviewId: number, reviewRequest: ReviewRequest): Observable<Review> {
    const reviews = this.reviewsSubject.value;
    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex === -1) {
      throw new Error('Review not found');
    }

    const updatedReview = {
      ...reviews[reviewIndex],
      rating: reviewRequest.rating,
      title: reviewRequest.title,
      comment: reviewRequest.comment,
      date: new Date() // Update the date when edited
    };

    const updatedReviews = [...reviews];
    updatedReviews[reviewIndex] = updatedReview;
    this.saveReviews(updatedReviews);

    return of(updatedReview);
  }

  deleteReview(reviewId: number, userId: number): Observable<boolean> {
    const reviews = this.reviewsSubject.value;
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('You can only delete your own reviews');
    }

    const updatedReviews = reviews.filter(r => r.id !== reviewId);
    this.saveReviews(updatedReviews);

    return of(true);
  }

  getUserReviewForProduct(productId: number, userId: number): Observable<Review | null> {
    const reviews = this.reviewsSubject.value;
    const userReview = reviews.find(r => r.productId === productId && r.userId === userId);
    return of(userReview || null);
  }

  getUserReviewsForProduct(productId: number, userId: number): Observable<Review[]> {
    const reviews = this.reviewsSubject.value;
    const userReviews = reviews.filter(r => r.productId === productId && r.userId === userId);
    return of(userReviews);
  }

  getAverageRating(productId: number): Observable<number> {
    const reviews = this.reviewsSubject.value;
    const productReviews = reviews.filter(r => r.productId === productId);
    
    if (productReviews.length === 0) {
      return of(0);
    }

    const average = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
    return of(Math.round(average * 10) / 10); // Round to 1 decimal place
  }
}
