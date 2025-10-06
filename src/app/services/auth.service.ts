import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User, LoginRequest, SignupRequest, AuthResponse } from '../models/user.model';

interface StoredUser extends User {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private readonly USERS_KEY = 'shopease_users';
  private readonly CURRENT_USER_KEY = 'shopease_current_user';
  private readonly TOKEN_KEY = 'shopease_token';

  constructor() {
    this.initializeDefaultUser();
    this.checkExistingSession();
  }


  private initializeDefaultUser(): void {
    const users = this.getStoredUsers();
    
    // Add default user if no users exist
    if (users.length === 0) {
      const defaultUser: StoredUser = {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        password: 'password'
      };
      
      users.push(defaultUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  private checkExistingSession(): void {
    const savedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    const token = localStorage.getItem(this.TOKEN_KEY);
    
    if (savedUser && token) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
    }
  }

  private getStoredUsers(): StoredUser[] {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: StoredUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private generateUserId(): number {
    const users = this.getStoredUsers();
    return users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
  }

  private generateToken(): string {
    return 'token_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const users = this.getStoredUsers();
    const user = users.find(u => 
      u.email.toLowerCase() === credentials.email.toLowerCase() && 
      u.password === credentials.password
    );

    if (user) {
      const userWithoutPassword: User = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address
      };

      const token = this.generateToken();
      const authResponse: AuthResponse = {
        user: userWithoutPassword,
        token
      };

      // Store session
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      localStorage.setItem(this.TOKEN_KEY, token);

      this.currentUserSubject.next(userWithoutPassword);
      this.isLoggedInSubject.next(true);

      return of(authResponse);
    }

    return throwError(() => new Error('Invalid email or password'));
  }

  signup(signupData: SignupRequest): Observable<AuthResponse> {
    const users = this.getStoredUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => 
      u.email.toLowerCase() === signupData.email.toLowerCase()
    );

    if (existingUser) {
      return throwError(() => new Error('User with this email already exists'));
    }

    // Validate password confirmation
    if (signupData.password !== signupData.confirmPassword) {
      return throwError(() => new Error('Passwords do not match'));
    }

    // Create new user
    const newStoredUser: StoredUser = {
      id: this.generateUserId(),
      email: signupData.email,
      firstName: signupData.firstName,
      lastName: signupData.lastName,
      password: signupData.password
    };

    // Save to localStorage
    users.push(newStoredUser);
    this.saveUsers(users);

    // Create user object without password
    const newUser: User = {
      id: newStoredUser.id,
      email: newStoredUser.email,
      firstName: newStoredUser.firstName,
      lastName: newStoredUser.lastName
    };

    const token = this.generateToken();
    const authResponse: AuthResponse = {
      user: newUser,
      token
    };

    // Store session
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(this.TOKEN_KEY, token);

    this.currentUserSubject.next(newUser);
    this.isLoggedInSubject.next(true);

    return of(authResponse);
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Helper method to get all registered users (for admin purposes)
  getAllUsers(): User[] {
    const users = this.getStoredUsers();
    return users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address
    }));
  }

  // Helper method to check if email exists
  emailExists(email: string): boolean {
    const users = this.getStoredUsers();
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
  }
}
