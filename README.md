# ShopEase - E-Commerce Shopping Application

🛒 **Live Demo:** [https://neeraj5976.github.io/ShopEase/](https://neeraj5976.github.io/ShopEase/)

A modern, responsive e-commerce shopping application built with Angular 16, featuring a complete shopping experience similar to Amazon.

## 🚀 Features

### 🛍️ Shopping Experience
- **Product Catalog** - Browse and search through various products
- **Product Details** - Detailed product pages with images, descriptions, and specifications
- **Shopping Cart** - Add, remove, and manage items in your cart
- **Categories** - Filter products by categories
- **Search Functionality** - Find products quickly with search

### 👤 User Management
- **User Registration** - Create new accounts with validation
- **User Login/Logout** - Secure authentication system
- **User Profiles** - Manage user information
- **Protected Routes** - Cart and user-specific features require authentication

### ⭐ Review System
- **Product Reviews** - Users can write multiple reviews per product
- **Rating System** - 5-star rating system for products
- **Review Management** - Edit and delete your own reviews
- **Review Display** - View all customer reviews with ratings and dates

### 📱 Modern UI/UX
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Sticky Navigation** - Header stays accessible while scrolling
- **Modern Styling** - Clean, professional design with Bootstrap 5
- **Interactive Elements** - Smooth animations and hover effects
- **Cart Counter** - Real-time cart item count in header

## 🛠️ Technology Stack

- **Frontend:** Angular 16
- **Styling:** Bootstrap 5, SCSS, Font Awesome
- **State Management:** RxJS, Services
- **Forms:** Reactive Forms with validation
- **Routing:** Angular Router with guards
- **Storage:** LocalStorage for data persistence
- **Deployment:** GitHub Pages

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Angular CLI (`npm install -g @angular/cli`)

### Installation
```bash
# Clone the repository
git clone https://github.com/Neeraj5976/ShopEase.git

# Navigate to project directory
cd ShopEase

# Install dependencies
npm install

# Start development server
ng serve
```

Navigate to `http://localhost:4200/` to view the application.

### Demo Account
- **Email:** user@example.com
- **Password:** password

## 📦 Build & Deployment

```bash
# Build for production
ng build --configuration production

# Deploy to GitHub Pages
ng deploy
```

## 🧪 Testing

```bash
# Run unit tests
ng test

# Run e2e tests
ng e2e
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable components
│   │   ├── header/         # Navigation header
│   │   └── footer/         # Site footer
│   ├── pages/              # Page components
│   │   ├── home/           # Home page
│   │   ├── products/       # Product listing
│   │   ├── product-detail/ # Product details
│   │   ├── cart/           # Shopping cart
│   │   ├── login/          # User login
│   │   └── signup/         # User registration
│   ├── services/           # Business logic services
│   │   ├── auth.service.ts    # Authentication
│   │   ├── product.service.ts # Product management
│   │   ├── cart.service.ts    # Cart management
│   │   └── review.service.ts  # Review system
│   ├── models/             # TypeScript interfaces
│   ├── guards/             # Route protection
│   └── app-routing.module.ts
├── assets/                 # Static assets
└── styles.scss            # Global styles
```

## 🔧 Features in Detail

### Authentication System
- JWT-like token simulation with localStorage
- Form validation with custom validators
- Email uniqueness validation
- Password confirmation matching
- Route guards for protected pages

### Shopping Cart
- User-specific cart persistence
- Real-time cart updates
- Quantity management
- Cart counter in header
- Order summary calculations

### Review System
- Multiple reviews per user per product
- Star rating system (1-5 stars)
- Review CRUD operations
- Date formatting and user verification
- Separate display of user vs. other reviews

### Responsive Design
- Mobile-first approach
- Bootstrap 5 grid system
- Sticky navigation header
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Neeraj Kumar**
- GitHub: [@Neeraj5976](https://github.com/Neeraj5976)
- Project: [ShopEase](https://github.com/Neeraj5976/ShopEase)

## 🙏 Acknowledgments

- Angular team for the amazing framework
- Bootstrap team for the responsive CSS framework
- Font Awesome for the beautiful icons
- GitHub Pages for free hosting
