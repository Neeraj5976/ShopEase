import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Product, ProductCategory } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  // Mock product data
  private mockProducts: Product[] = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      description: 'The most advanced iPhone ever with A17 Pro chip, titanium design, and advanced camera system.',
      price: 1199,
      originalPrice: 1299,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      category: 'Electronics',
      rating: 4.8,
      reviewsCount: 2847,
      inStock: true,
      features: ['6.7-inch display', 'A17 Pro chip', '48MP camera', '5G capable']
    },
    {
      id: 2,
      name: 'MacBook Air M2',
      description: 'Supercharged by M2 chip. Incredibly thin and light laptop with all-day battery life.',
      price: 1099,
      originalPrice: 1199,
      imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400',
      category: 'Electronics',
      rating: 4.7,
      reviewsCount: 1923,
      inStock: true,
      features: ['M2 chip', '13.6-inch display', '18-hour battery', 'Fanless design']
    },
    {
      id: 3,
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality.',
      price: 349,
      originalPrice: 399,
      imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',
      category: 'Electronics',
      rating: 4.6,
      reviewsCount: 5672,
      inStock: true,
      features: ['30-hour battery', 'Active noise canceling', 'Quick charge', 'Touch controls']
    },
    {
      id: 4,
      name: 'Nike Air Max 270',
      description: 'Comfortable running shoes with Max Air cushioning and breathable mesh upper.',
      price: 150,
      originalPrice: 180,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      category: 'Fashion',
      rating: 4.4,
      reviewsCount: 3421,
      inStock: true,
      features: ['Max Air cushioning', 'Breathable mesh', 'Durable rubber sole', 'Lightweight']
    },
    {
      id: 5,
      name: 'Samsung 55" QLED TV',
      description: '4K QLED Smart TV with Quantum Dot technology and HDR support.',
      price: 899,
      originalPrice: 1099,
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
      category: 'Electronics',
      rating: 4.5,
      reviewsCount: 2156,
      inStock: true,
      features: ['4K QLED', 'Smart TV', 'HDR10+', 'Voice control']
    },
    {
      id: 6,
      name: 'Adidas Ultraboost 22',
      description: 'Premium running shoes with Boost midsole technology and Primeknit upper.',
      price: 190,
      originalPrice: 220,
      imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400',
      category: 'Fashion',
      rating: 4.3,
      reviewsCount: 1876,
      inStock: true,
      features: ['Boost midsole', 'Primeknit upper', 'Continental rubber', 'Energy return']
    }
  ];

  private mockCategories: ProductCategory[] = [
    { id: 1, name: 'Electronics', imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300' },
    { id: 2, name: 'Fashion', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300' },
    { id: 3, name: 'Home & Garden', imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300' },
    { id: 4, name: 'Sports', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300' }
  ];

  constructor() {
    this.productsSubject.next(this.mockProducts);
  }

  getAllProducts(): Observable<Product[]> {
    return of(this.mockProducts);
  }

  getProductById(id: number): Observable<Product | undefined> {
    const product = this.mockProducts.find(p => p.id === id);
    return of(product);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    const filteredProducts = this.mockProducts.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
    return of(filteredProducts);
  }

  searchProducts(query: string): Observable<Product[]> {
    const filteredProducts = this.mockProducts.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
    return of(filteredProducts);
  }

  getCategories(): Observable<ProductCategory[]> {
    return of(this.mockCategories);
  }

  getFeaturedProducts(): Observable<Product[]> {
    // Return products with high ratings
    const featuredProducts = this.mockProducts.filter(p => p.rating >= 4.5);
    return of(featuredProducts);
  }
}
