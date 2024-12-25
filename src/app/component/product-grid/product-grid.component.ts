import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Product as GraphQLProduct } from '../../models/graphql.types';
import { CartService } from '../../service/cart.service';
import { firstValueFrom } from 'rxjs';

interface Product extends GraphQLProduct {
  quantity: number;
  total: number;
  image?: string;
  images: string[];
  isLocal?: boolean;
}

@Component({
  selector: 'app-product-grid',
  templateUrl: './product-grid.component.html',
  styleUrls: ['./product-grid.component.scss']
})
export class ProductGridComponent {
  @Input() products: Product[] = [];
  @Output() deleteProduct = new EventEmitter<{ event: Event; productId: string }>();

  constructor(private cartService: CartService) {}

  onDeleteProduct(event: Event, productId: string): void {
    event.stopPropagation();
    this.deleteProduct.emit({ event, productId });
  }

  async addToCart(product: Product): Promise<void> {
    await firstValueFrom(this.cartService.addToCart(product));
  }
}
