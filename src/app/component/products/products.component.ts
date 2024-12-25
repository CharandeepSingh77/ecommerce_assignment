import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { GraphqlService } from '../../service/graphql.service';
import { CartService } from '../../service/cart.service';
import { CategoryModalComponent } from '../category-modal/category-modal.component';
import { Product as GraphQLProduct, Category as GraphQLCategory } from '../../models/graphql.types';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

interface Product extends GraphQLProduct {
  quantity: number;
  total: number;
  image?: string;
  images: string[];
  isLocal?: boolean;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit, OnDestroy {
  @ViewChild('categoryModal') categoryModal!: CategoryModalComponent;

  public productList: Product[] = [];
  public filteredProducts: Product[] = [];
  public currentCategory: string = 'electronics';  // Set default to 'electronics'
  public categories: GraphQLCategory[] = [];
  private productModal: any;

  constructor(
    private graphqlService: GraphqlService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    setTimeout(() => {
      this.initializeProductModal();
    }, 1000);
  }

  private initializeProductModal(): void {
    try {
      const productModalEl = document.getElementById('productModal');
      if (productModalEl) {
        this.productModal = new bootstrap.Modal(productModalEl, {
          keyboard: true,
          backdrop: true,
          focus: true
        });
      }
    } catch (error) {
      console.error('Error initializing product modal:', error);
    }
  }

  async loadProducts(): Promise<void> {
    console.log('Loading products...');

    const savedProducts = localStorage.getItem('products');
    const localProducts: Product[] = savedProducts ? JSON.parse(savedProducts).map((product: any) => ({
      ...product,
      quantity: 1,
      total: product.price,
      isLocal: true
    })) : [];

    try {
      const products = await firstValueFrom(this.graphqlService.getProducts());
      console.log('API Products received:', products);
      const apiProducts = products.map(product => ({
        ...product,
        quantity: 1,
        total: product.price,
        images: product.images || [],
        isLocal: false
      }));

      this.productList = [...localProducts, ...apiProducts];
      this.applyFilters();
      console.log('Combined products:', this.productList);
    } catch (err) {
      console.error('Error loading API products:', err);

      this.productList = localProducts;
      this.applyFilters();
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const categories = await firstValueFrom(this.graphqlService.getCategories());
      this.categories = categories;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  public openCategoryModal(event?: Event, category?: GraphQLCategory): void {
    if (event) {
      event.stopPropagation();
    }
    this.categoryModal.openModal(category);
  }

  public onCategoryAdded(): void {
    this.loadCategories();
  }

  public onCategoryUpdated(): void {
    this.loadCategories();
  }

  async deleteCategory(event: Event, categoryId: string): Promise<void> {
    event?.stopPropagation();

    try {
      await firstValueFrom(this.graphqlService.deleteCategory(categoryId));
      if (categoryId === 'default_electronics' && this.currentCategory === 'electronics') {
        this.currentCategory = 'all';
      }
      await this.loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  async handleProductDelete(data: { event: Event, productId: string }): Promise<void> {
    data.event.stopPropagation();

    const productIndex = this.productList.findIndex(p => p.id === data.productId);
    if (productIndex !== -1) {
      const deletedProduct = this.productList[productIndex];
      this.productList = this.productList.filter(p => p.id !== data.productId);
      this.applyFilters();

      if (data.productId.startsWith('local_')) {

        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedProducts = products.filter((p: any) => p.id !== data.productId);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
      } else {

        try {
          await firstValueFrom(this.graphqlService.deleteProduct(data.productId));
        } catch (error) {
          console.error('Error deleting product:', error);

          this.productList = [...this.productList.slice(0, productIndex), deletedProduct, ...this.productList.slice(productIndex)];
          this.applyFilters();
        }
      }
    }
  }

  addToCart(item: any): void {
    this.cartService.addToCart(item);
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  filter(category: string): void {
    this.currentCategory = category;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredProducts = this.currentCategory === 'all'
      ? this.productList
      : this.productList.filter(product => 
          product.category?.name.toLowerCase() === this.currentCategory.toLowerCase()
        );
  }
}
