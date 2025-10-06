import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { Review, ReviewRequest } from '../../models/review.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | undefined;
  relatedProducts: Product[] = [];
  quantity: number = 1;
  reviews: Review[] = [];
  reviewCount: number = 0;
  currentUser: User | null = null;
  isLoggedIn: boolean = false;
  userReviews: Review[] = [];
  otherReviews: Review[] = [];
  
  // Review form
  reviewForm: FormGroup;
  showReviewForm: boolean = false;
  isEditingReview: boolean = false;
  isSubmittingReview: boolean = false;
  editingReviewId: number | null = null;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private productService: ProductService,
    private cartService: CartService,
    private reviewService: ReviewService,
    private authService: AuthService
  ) {
    this.reviewForm = this.formBuilder.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    // Initialize review count
    this.reviewCount = 0;
    
    // Subscribe to authentication state
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
      })
    );

    this.subscriptions.push(
      this.route.params.subscribe(params => {
        const productId = +params['id'];
        if (productId) {
          this.loadProduct(productId);
          this.loadReviews(productId);
          this.loadUserReview(productId);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe(product => {
      this.product = product;
      if (product) {
        this.loadRelatedProducts(product.category);
      }
    });
  }

  loadRelatedProducts(category: string): void {
    this.productService.getProductsByCategory(category).subscribe(products => {
      // Filter out current product and limit to 4 related products
      this.relatedProducts = products
        .filter(p => p.id !== this.product?.id)
        .slice(0, 4);
    });
  }

  loadReviews(productId: number): void {
    this.reviewService.getReviewsForProduct(productId).subscribe(reviews => {
      this.reviews = reviews || [];
      this.reviewCount = this.reviews.length;
      this.separateUserAndOtherReviews();
    });
  }

  private separateUserAndOtherReviews(): void {
    if (this.currentUser) {
      this.otherReviews = this.reviews.filter(review => review.userId !== this.currentUser!.id);
    } else {
      this.otherReviews = this.reviews;
    }
  }

  loadUserReview(productId: number): void {
    if (this.currentUser) {
      this.reviewService.getUserReviewsForProduct(productId, this.currentUser.id).subscribe(reviews => {
        this.userReviews = reviews;
        this.separateUserAndOtherReviews();
      });
    } else {
      this.userReviews = [];
      this.separateUserAndOtherReviews();
    }
  }

  increaseQuantity(): void {
    if (this.quantity < 10) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product && this.product.inStock) {
      try {
        this.cartService.addToCart(this.product, this.quantity);
        // You could add a toast notification here
        alert(`${this.product.name} (${this.quantity}) added to cart!`);
      } catch (error: any) {
        alert(error.message);
        this.router.navigate(['/login']);
      }
    }
  }

  addToWishlist(): void {
    // This would typically save to a wishlist service
    alert('Added to wishlist! (Feature not yet implemented)');
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
    // Scroll to top when navigating to new product
    window.scrollTo(0, 0);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }

  getDiscountPercentage(): number {
    if (this.product && this.product.originalPrice) {
      const discount = this.product.originalPrice - this.product.price;
      const percentage = (discount / this.product.originalPrice) * 100;
      return Math.round(percentage);
    }
    return 0;
  }

  // Review form methods
  showWriteReviewForm(): void {
    if (!this.isLoggedIn) {
      alert('Please login to write a review');
      this.router.navigate(['/login']);
      return;
    }
    
    this.showReviewForm = true;
    this.isEditingReview = false;
    this.reviewForm.reset({
      rating: 5,
      title: '',
      comment: ''
    });
  }

  editReview(review: Review): void {
    this.showReviewForm = true;
    this.isEditingReview = true;
    this.editingReviewId = review.id;
    this.reviewForm.patchValue({
      rating: review.rating,
      title: review.title,
      comment: review.comment
    });
  }

  cancelReview(): void {
    this.showReviewForm = false;
    this.isEditingReview = false;
    this.editingReviewId = null;
    this.reviewForm.reset();
  }

  submitReview(): void {
    if (!this.reviewForm.valid || !this.product || !this.currentUser) {
      return;
    }

    this.isSubmittingReview = true;

    const reviewRequest: ReviewRequest = {
      productId: this.product.id,
      rating: this.reviewForm.value.rating,
      title: this.reviewForm.value.title,
      comment: this.reviewForm.value.comment
    };

    if (this.isEditingReview && this.editingReviewId) {
      // Update existing review
      this.reviewService.updateReview(this.editingReviewId, reviewRequest).subscribe({
        next: (updatedReview) => {
          this.loadReviews(this.product!.id);
          this.loadUserReview(this.product!.id);
          this.showReviewForm = false;
          this.isSubmittingReview = false;
          this.editingReviewId = null;
          alert('Review updated successfully!');
        },
        error: (error) => {
          this.isSubmittingReview = false;
          alert(error.message || 'Failed to update review');
        }
      });
    } else {
      // Add new review
      const userName = `${this.currentUser.firstName} ${this.currentUser.lastName.charAt(0)}.`;
      
      try {
        this.reviewService.addReview(reviewRequest, this.currentUser.id, userName).subscribe({
        next: (newReview) => {
          this.loadReviews(this.product!.id); // This will update the count
          this.loadUserReview(this.product!.id);
          this.showReviewForm = false;
          this.isSubmittingReview = false;
          alert('Review added successfully!');
        },
          error: (error) => {
            this.isSubmittingReview = false;
            alert(error.message || 'Failed to add review');
          }
        });
      } catch (error: any) {
        this.isSubmittingReview = false;
        alert(error.message);
      }
    }
  }

  deleteReview(review: Review): void {
    if (!this.currentUser) {
      return;
    }

    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(review.id, this.currentUser.id).subscribe({
        next: () => {
          this.loadReviews(this.product!.id); // This will update the count
          this.loadUserReview(this.product!.id);
          alert('Review deleted successfully!');
        },
        error: (error) => {
          alert(error.message || 'Failed to delete review');
        }
      });
    }
  }

  getReviewDate(date: Date): string {
    const reviewDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else {
      return reviewDate.toLocaleDateString();
    }
  }

  getRatingStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getEmptyRatingStars(rating: number): number[] {
    return Array(5 - rating).fill(0);
  }
}
