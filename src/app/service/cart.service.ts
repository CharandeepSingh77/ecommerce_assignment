import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartItemList: any[] = [];
  private productList = new BehaviorSubject<any[]>([]);
  private grandTotal = new BehaviorSubject<number>(0);
  public search = new BehaviorSubject<string>('');

  constructor() {}

  // Get the current products in the cart
  getProducts(): Observable<any[]> {
    return this.productList.asObservable();
  }

  // Get the current grand total
  getGrandTotal(): Observable<number> {
    return this.grandTotal.asObservable();
  }

  // Add products to the cart
  setProduct(product: any) {
    this.cartItemList.push(...product);
    this.productList.next(this.cartItemList);
    this.updateTotalPrice();
  }

  // Add to the cart (increase quantity or add new item)
  addToCart(product: any) {
    const existingProduct = this.cartItemList.find((item: any) => item.id === product.id);
    if (existingProduct) {
      existingProduct.quantity = (existingProduct.quantity || 1) + 1;
      existingProduct.total = existingProduct.price * existingProduct.quantity;
    } else {
      const cartItem = {
        ...product,
        quantity: 1,
        total: product.price,
        image: product.images?.[0] || product.image || ''
      };
      this.cartItemList.push(cartItem);
    }
    this.productList.next(this.cartItemList);
    this.updateTotalPrice();
  }

  // Remove a product from the cart
  removeCartItem(product: any) {
    const index = this.cartItemList.findIndex((item: any) => item.id === product.id);
    if (index !== -1) {
      this.cartItemList.splice(index, 1);
      this.productList.next(this.cartItemList);
      this.updateTotalPrice();
    }
  }

  // Remove all items from cart
  removeAllCart() {
    this.cartItemList = [];
    this.productList.next(this.cartItemList);
    this.updateTotalPrice();
  }

  // Get the total price of the cart
  getTotalPrice(): number {
    return this.grandTotal.getValue();
  }

  // Update the grand total price of the cart
  private updateTotalPrice() {
    const total = this.cartItemList.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    this.grandTotal.next(total);
  }

  // Process checkout and place order
  processCheckout(orderData: any): Observable<any> {
    // Here you would typically make an HTTP POST request to your backend
    // For now, we'll simulate a successful order with a delay
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Order placed successfully' });
        observer.complete();
      }, 1000);
    });
  }

  // Search products in the cart
  searchProducts(searchTerm: string) {
    this.search.next(searchTerm);
    const filteredProducts = this.cartItemList.filter((product: any) => {
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    this.productList.next(filteredProducts);
  }
}
