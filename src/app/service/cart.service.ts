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

  constructor() { }


  getProducts(): Observable<any[]> {
    return this.productList.asObservable();
  }


  getGrandTotal(): Observable<number> {
    return this.grandTotal.asObservable();
  }


  setProduct(product: any) {
    this.cartItemList.push(...product);
    this.productList.next(this.cartItemList);
    this.updateTotalPrice();
  }


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

  removeCartItem(product: any) {
    const index = this.cartItemList.findIndex((item: any) => item.id === product.id);
    if (index !== -1) {
      this.cartItemList.splice(index, 1);
      this.productList.next(this.cartItemList);
      this.updateTotalPrice();
    }
  }


  removeAllCart() {
    this.cartItemList = [];
    this.productList.next(this.cartItemList);
    this.updateTotalPrice();
  }

  getTotalPrice(): number {
    return this.grandTotal.getValue();
  }

  private updateTotalPrice() {
    const total = this.cartItemList.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
    this.grandTotal.next(total);
  }


  processCheckout(orderData: any): Observable<any> {


    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Order placed successfully' });
        observer.complete();
      }, 1000);
    });
  }


  searchProducts(searchTerm: string) {
    this.search.next(searchTerm);
    const filteredProducts = this.cartItemList.filter((product: any) => {
      return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
    this.productList.next(filteredProducts);
  }
}
