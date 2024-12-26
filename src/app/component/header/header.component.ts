import { Component, OnInit } from '@angular/core';
import { CartService } from '../../service/cart.service';
import { Router } from '@angular/router';
import { CartItem } from '../../models/cart.types';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public totalItem: number = 0;
  public searchTerm: string = '';

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit(): void {
    this.cartService.getProducts()
      .subscribe((products: CartItem[]) => {
        this.totalItem = products.length;
      });
  }

  search(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    console.log(this.searchTerm);
    this.cartService.search.next(this.searchTerm);
  }


}
