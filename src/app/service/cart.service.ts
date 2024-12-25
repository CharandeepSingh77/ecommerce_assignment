import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Product } from '../models/graphql.types';
import { CartItem } from '../models/cart.types';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'cart';
  private cartItemList: CartItem[] = [];
  private productList = new BehaviorSubject<CartItem[]>([]);
  private grandTotal = new BehaviorSubject<number>(0);
  public search = new BehaviorSubject<string>("");

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
    if (savedCart) {
      this.cartItemList = JSON.parse(savedCart);
      this.productList.next(this.cartItemList);
      this.updateTotalPrice();
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItemList));
  }

  getProducts(): Observable<CartItem[]> {
    return this.productList.asObservable();
  }

  getGrandTotal(): Observable<number> {
    return this.grandTotal.asObservable();
  }

  addToCart(product: Product): Observable<void> {
    const existingProduct = this.cartItemList.find(item => item.id === product.id);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      const cartItem: CartItem = {
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        image: product.images[0] || '',
        quantity: 1
      };
      this.cartItemList.push(cartItem);
    }
    this.productList.next(this.cartItemList);
    this.updateTotalPrice();
    this.saveToStorage();
    return of(void 0);
  }

  removeCartItem(item: CartItem): Observable<void> {
    this.cartItemList = this.cartItemList.filter(cartItem => cartItem.id !== item.id);
    this.productList.next(this.cartItemList);
    this.updateTotalPrice();
    this.saveToStorage();
    return of(void 0);
  }

  updateQuantity(item: CartItem, quantity: number): Observable<void> {
    const cartItem = this.cartItemList.find(i => i.id === item.id);
    if (cartItem) {
      cartItem.quantity = quantity;
      this.productList.next(this.cartItemList);
      this.updateTotalPrice();
      this.saveToStorage();
    }
    return of(void 0);
  }

  removeAllCart(): Observable<void> {
    this.cartItemList = [];
    this.productList.next(this.cartItemList);
    this.updateTotalPrice();
    localStorage.removeItem(this.CART_STORAGE_KEY);
    return of(void 0);
  }

  private updateTotalPrice(): void {
    const total = this.cartItemList.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0);
    this.grandTotal.next(total);
  }

  getItemTotal(item: CartItem): number {
    return item.price * item.quantity;
  }
}
