import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>({ items: [], totalAmount: 0, totalItems: 0 });
  public cart$ = this.cartSubject.asObservable();
  
  private currentUserId: number | null = null;
  private readonly CART_KEY_PREFIX = 'shopease_cart_user_';

  constructor() {
    // Initialize with empty cart - will be loaded when user logs in
    this.initializeEmptyCart();
  }

  // Set the current user and load their cart
  setCurrentUser(userId: number | null): void {
    this.currentUserId = userId;
    if (userId) {
      this.loadUserCart(userId);
    } else {
      this.clearCart();
    }
  }

  private initializeEmptyCart(): void {
    const emptyCart: Cart = { items: [], totalAmount: 0, totalItems: 0 };
    this.cartSubject.next(emptyCart);
  }

  private loadUserCart(userId: number): void {
    const cartKey = this.CART_KEY_PREFIX + userId;
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      this.cartSubject.next(cart);
    } else {
      this.initializeEmptyCart();
    }
  }

  private saveUserCart(): void {
    if (this.currentUserId) {
      const cartKey = this.CART_KEY_PREFIX + this.currentUserId;
      const currentCart = this.cartSubject.value;
      localStorage.setItem(cartKey, JSON.stringify(currentCart));
    }
  }

  addToCart(product: Product, quantity: number = 1): void {
    if (!this.canModifyCart()) {
      throw new Error('Please login to add items to cart');
    }

    const currentCart = this.cartSubject.value;
    const existingItemIndex = currentCart.items.findIndex(item => item.product.id === product.id);

    if (existingItemIndex > -1) {
      // Item already exists, update quantity
      currentCart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      const newItem: CartItem = { product, quantity };
      currentCart.items.push(newItem);
    }

    this.updateCartTotals(currentCart);
    this.saveUserCart();
  }

  removeFromCart(productId: number): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.product.id !== productId);
    
    this.updateCartTotals(currentCart);
    this.saveUserCart();
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentCart = this.cartSubject.value;
    const itemIndex = currentCart.items.findIndex(item => item.product.id === productId);

    if (itemIndex > -1) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        currentCart.items[itemIndex].quantity = quantity;
        this.updateCartTotals(currentCart);
        this.saveUserCart();
      }
    }
  }

  clearCart(): void {
    const emptyCart: Cart = { items: [], totalAmount: 0, totalItems: 0 };
    this.cartSubject.next(emptyCart);
    
    // Remove user-specific cart from localStorage
    if (this.currentUserId) {
      const cartKey = this.CART_KEY_PREFIX + this.currentUserId;
      localStorage.removeItem(cartKey);
    }
  }

  getCart(): Observable<Cart> {
    return this.cart$;
  }

  getCartItemCount(): number {
    return this.cartSubject.value.totalItems;
  }

  getCartTotal(): number {
    return this.cartSubject.value.totalAmount;
  }

  private updateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  // Method to check if user is logged in before allowing cart operations
  canModifyCart(): boolean {
    return this.currentUserId !== null;
  }
}
