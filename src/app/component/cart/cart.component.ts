import { Component, OnInit } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { ToastService } from '../../service/toast.service';
import { Router } from '@angular/router';

interface CartItem {
  id: number;
  title: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
  category: string;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  public products: CartItem[] = [];
  public grandTotal: number = 0;
  showCheckoutForm = false;

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getProducts().subscribe((products: CartItem[]) => {
      this.products = products;
    });

  
    this.cartService.getGrandTotal().subscribe((total: number) => {
      this.grandTotal = total;
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeCartItem(item);
  }

  emptyCart(): void {
    this.cartService.removeAllCart();
  }

  increaseQuantity(item: CartItem): void {
    item.quantity = (item.quantity || 1) + 1;
    item.total = item.price * item.quantity;
    this.updateTotalPrice();
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
      item.total = item.price * item.quantity;
      this.updateTotalPrice();
    }
  }

  checkout(): void {
    if (this.products.length === 0) {
      console.error('Your cart is empty');
      return;
    }

    const orderData = {
      total: this.grandTotal,
      items: this.products
    };

    this.cartService.processCheckout(orderData).subscribe({
      next: (response) => {
        this.toastService.showToast('Order placed successfully!', 'success');
        this.cartService.removeAllCart();
        this.showCheckoutForm = false;
      },
      error: (error) => {
        this.toastService.showToast('Error processing order. Please try again.', 'error');
      }
    });
  }

  openCheckoutForm(): void {
    if (this.products.length > 0) {
      this.showCheckoutForm = true;
    }
  }

  onFormSubmit(formData: any): void {
    const orderData = {
      ...formData,
      total: this.grandTotal,
      items: this.products
    };

    this.cartService.processCheckout(orderData).subscribe({
      next: (response) => {
        this.toastService.showToast('Order placed successfully!', 'success');
        this.cartService.removeAllCart();
        this.showCheckoutForm = false;
      },
      error: (error) => {
        this.toastService.showToast('Error processing order. Please try again.', 'error');
      }
    });
  }

  private updateTotalPrice(): void {
    let total = 0;
    this.products.forEach(item => {
      total += item.total;
    });
    this.grandTotal = total;
  }
}
