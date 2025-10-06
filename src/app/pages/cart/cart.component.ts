import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Cart, CartItem } from '../../models/cart.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cart: Cart | null = null;
  recommendedProducts: Product[] = [];
  promoCode: string = '';
  promoApplied: boolean = false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart changes
    this.subscriptions.push(
      this.cartService.cart$.subscribe(cart => {
        this.cart = cart;
        this.loadRecommendedProducts();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadRecommendedProducts(): void {
    // Load some recommended products (could be based on cart items)
    this.productService.getAllProducts().subscribe(products => {
      // Filter out products already in cart and limit to 4
      const cartProductIds = this.cart?.items.map(item => item.product.id) || [];
      this.recommendedProducts = products
        .filter(product => !cartProductIds.includes(product.id))
        .slice(0, 4);
    });
  }

  increaseQuantity(productId: number): void {
    const item = this.cart?.items.find(item => item.product.id === productId);
    if (item && item.quantity < 10) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId: number): void {
    const item = this.cart?.items.find(item => item.product.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  updateQuantity(productId: number, event: any): void {
    const quantity = parseInt(event.target.value);
    if (quantity >= 1 && quantity <= 10) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  removeFromCart(productId: number): void {
    if (confirm('Are you sure you want to remove this item from your cart?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      this.cartService.clearCart();
      this.promoApplied = false;
      this.promoCode = '';
    }
  }

  addToCart(product: Product): void {
    try {
      this.cartService.addToCart(product);
    } catch (error: any) {
      alert(error.message);
      this.router.navigate(['/login']);
    }
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  getItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  getShippingCost(): number {
    // Free shipping for orders over $50
    if (this.cart && this.cart.totalAmount >= 50) {
      return 0;
    }
    return 9.99;
  }

  getTaxAmount(): number {
    // 8.25% tax rate
    const taxRate = 0.0825;
    return this.cart ? this.cart.totalAmount * taxRate : 0;
  }

  getOrderTotal(): number {
    if (!this.cart) return 0;
    
    let total = this.cart.totalAmount + this.getShippingCost() + this.getTaxAmount();
    
    // Apply promo discount if applicable
    if (this.promoApplied) {
      total *= 0.9; // 10% discount
    }
    
    return total;
  }

  applyPromoCode(): void {
    // Mock promo code validation
    const validPromoCodes = ['SAVE10', 'WELCOME', 'DISCOUNT'];
    
    if (validPromoCodes.includes(this.promoCode.toUpperCase())) {
      this.promoApplied = true;
      alert('Promo code applied! You saved 10%');
    } else if (this.promoCode.trim()) {
      alert('Invalid promo code. Try SAVE10, WELCOME, or DISCOUNT');
    }
  }

  proceedToCheckout(): void {
    // In a real app, this would navigate to checkout page
    alert(`Proceeding to checkout with total: $${this.getOrderTotal().toFixed(2)}\n\nThis would normally redirect to a secure checkout page.`);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
}
