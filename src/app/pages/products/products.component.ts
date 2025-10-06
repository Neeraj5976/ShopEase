import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductCategory } from '../../models/product.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: ProductCategory[] = [];
  
  selectedCategory: string = '';
  selectedPriceRange: string = '';
  selectedRating: number = 0;
  searchQuery: string = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    
    // Subscribe to route parameters for category filtering
    this.subscriptions.push(
      this.route.params.subscribe(params => {
        if (params['category']) {
          this.selectedCategory = params['category'].toLowerCase();
          this.applyFilters();
        }
      })
    );

    // Subscribe to query parameters for search
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        if (params['search']) {
          this.searchQuery = params['search'];
          this.searchProducts();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe(products => {
      this.products = products;
      this.applyFilters();
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  searchProducts(): void {
    if (this.searchQuery.trim()) {
      this.productService.searchProducts(this.searchQuery).subscribe(products => {
        this.filteredProducts = products;
      });
    } else {
      this.applyFilters();
    }
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    if (category) {
      this.router.navigate(['/products', category]);
    } else {
      this.router.navigate(['/products']);
    }
    this.applyFilters();
  }

  filterByPrice(priceRange: string): void {
    this.selectedPriceRange = priceRange;
    this.applyFilters();
  }

  filterByRating(rating: number): void {
    this.selectedRating = rating;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === this.selectedCategory
      );
    }

    // Apply price range filter
    if (this.selectedPriceRange) {
      filtered = filtered.filter(product => {
        switch (this.selectedPriceRange) {
          case 'under-100':
            return product.price < 100;
          case '100-500':
            return product.price >= 100 && product.price <= 500;
          case '500-1000':
            return product.price > 500 && product.price <= 1000;
          case 'over-1000':
            return product.price > 1000;
          default:
            return true;
        }
      });
    }

    // Apply rating filter
    if (this.selectedRating > 0) {
      filtered = filtered.filter(product => product.rating >= this.selectedRating);
    }

    this.filteredProducts = filtered;
  }

  sortProducts(event: any): void {
    const sortBy = event.target.value;
    
    switch (sortBy) {
      case 'name-asc':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating-desc':
        this.filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
    }
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedPriceRange = '';
    this.selectedRating = 0;
    this.searchQuery = '';
    this.router.navigate(['/products']);
    this.applyFilters();
  }

  addToCart(product: Product): void {
    try {
      this.cartService.addToCart(product);
      // You could add a toast notification here
    } catch (error: any) {
      alert(error.message);
      this.router.navigate(['/login']);
    }
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0);
  }
}
