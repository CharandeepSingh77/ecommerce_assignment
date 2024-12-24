import { GraphqlService } from '../../service/graphql.service';
import { CartService } from '../../service/cart.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Product as GraphQLProduct, Category as GraphQLCategory } from '../../models/graphql.types';
import { CategoryModalComponent } from '../category-modal/category-modal.component';

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

  loadCategories(): void {
    this.graphqlService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  filter(category: string): void {
    this.currentCategory = category;
    this.applyFilters();
  }

  deleteCategory(event: Event, categoryId: string): void {

    event?.stopPropagation();

    this.graphqlService.deleteCategory(categoryId).subscribe({
      next: (success) => {
        if (success) {

          if (categoryId === 'default_electronics' && this.currentCategory === 'electronics') {
            this.currentCategory = 'all';
          }
          this.loadCategories();
        }
      },
      error: (error) => {
        console.error('Error deleting category:', error);
      }
    });
  }

  public loadProducts(): void {
    console.log('Loading products...');

    const savedProducts = localStorage.getItem('products');
    const localProducts: Product[] = savedProducts ? JSON.parse(savedProducts).map((product: any) => ({
      ...product,
      quantity: 1,
      total: product.price,
      isLocal: true
    })) : [];

    this.graphqlService.getProducts().subscribe({
      next: (products) => {
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
      },
      error: (err) => {
        console.error('Error loading API products:', err);

        this.productList = localProducts;
        this.applyFilters();
      }
    });
  }

  private applyFilters(): void {
    this.filteredProducts = [...this.productList];


    if (this.currentCategory !== 'all') {
      this.filteredProducts = this.filteredProducts.filter(product => {
        return product.category?.name.toLowerCase() === this.currentCategory.toLowerCase();
      });
    }
  }

  handleProductDelete(data: { event: Event, productId: string }): void {
    const { event, productId } = data;
    event.stopPropagation();


    const productIndex = this.productList.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      const deletedProduct = this.productList[productIndex];
      this.productList = this.productList.filter(p => p.id !== productId);
      this.applyFilters();

      if (productId.startsWith('local_')) {

        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const updatedProducts = products.filter((p: any) => p.id !== productId);
        localStorage.setItem('products', JSON.stringify(updatedProducts));
      } else {

        this.graphqlService.deleteProduct(productId).subscribe({
          error: (error) => {
            console.error('Error deleting product:', error);

            this.productList = [...this.productList.slice(0, productIndex), deletedProduct, ...this.productList.slice(productIndex)];
            this.applyFilters();
          }
        });
      }
    }
  }

  addToCart(item: any): void {
    this.cartService.addToCart(item);
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }
}
