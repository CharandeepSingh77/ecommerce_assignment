import { Component, OnInit } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { ToastService } from '../../service/toast.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CartItem } from '../../models/cart.types';

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
    public cartService: CartService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.getProducts().subscribe(products => {
      this.products = products;
    });

    this.cartService.getGrandTotal().subscribe(total => {
      this.grandTotal = total;
    });
  }

  async removeItem(item: CartItem): Promise<void> {
    await firstValueFrom(this.cartService.removeCartItem(item));
    this.toastService.showToast('Item removed from cart', 'success');
  }

  async emptyCart(): Promise<void> {
    await firstValueFrom(this.cartService.removeAllCart());
    this.toastService.showToast('Cart cleared', 'success');
  }

  async increaseQuantity(item: CartItem): Promise<void> {
    await firstValueFrom(this.cartService.updateQuantity(item, item.quantity + 1));
  }

  async decreaseQuantity(item: CartItem): Promise<void> {
    if (item.quantity > 1) {
      await firstValueFrom(this.cartService.updateQuantity(item, item.quantity - 1));
    }
  }

  openCheckoutForm(): void {
    if (this.products.length > 0) {
      this.showCheckoutForm = true;
    } else {
      this.toastService.showToast('Your cart is empty', 'error');
    }
  }

  async onFormSubmit(formData: any): Promise<void> {
    if (this.products.length === 0) {
      this.toastService.showToast('Your cart is empty', 'error');
      return;
    }

    try {
      await firstValueFrom(this.cartService.removeAllCart());
      this.toastService.showToast('Order placed successfully!', 'success');
      this.showCheckoutForm = false;
      this.router.navigate(['/products']);
    } catch (error) {
      this.toastService.showToast('Error processing order', 'error');
    }
  }
}
