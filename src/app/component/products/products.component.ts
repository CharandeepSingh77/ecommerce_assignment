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
    this.initializeProductModal();
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
    const savedProducts = localStorage.getItem('products');
    const localProducts: Product[] = savedProducts ? JSON.parse(savedProducts).map((product: any) => ({
      ...product,
      quantity: 1,
      total: product.price,
      isLocal: true
    })) : [];

    try {
      const products = await firstValueFrom(this.graphqlService.getProducts());
      const apiProducts = products.map(product => ({
        ...product,
        quantity: 1,
        total: product.price,
        images: product.images || [],
        isLocal: false
      }));

      this.productList = [...localProducts, ...apiProducts];
      this.applyFilters();
    } catch (err) {
      console.error('Error loading API products:', err);
      this.productList = localProducts;
      this.applyFilters();
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const categories = await firstValueFrom(this.graphqlService.getCategories());
      
      // Initially filter to show only Electronics from default categories
     
      let filteredCategories = categories.filter(category => 
        category.name.toLowerCase().includes('electronic')
      );

      // Get user-created category IDs from localStorage
      const userCreatedIds = localStorage.getItem('userCreatedCategoryIds');
      if (userCreatedIds) {
        const savedIds = JSON.parse(userCreatedIds);
        // Add user-created categories from API results
        const userCategories = categories.filter(cat => savedIds.includes(cat.id));
        filteredCategories = [...filteredCategories, ...userCategories];
      }
      
      this.categories = filteredCategories;

      // If current category no longer exists, switch to 'all'
      if (this.currentCategory !== 'all' && 
          !this.categories.some(c => c.name.toLowerCase() === this.currentCategory.toLowerCase())) {
        this.currentCategory = 'all';
      }

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
      const result = await firstValueFrom(this.graphqlService.deleteCategory(categoryId));
      
      if (result) {
      
        if (this.categories.find(c => c.id === categoryId)?.name.toLowerCase() === this.currentCategory.toLowerCase()) {
          this.currentCategory = 'all';
        }
        
        // Remove ID from localStorage if it was a user-created category
        const userCreatedIds = localStorage.getItem('userCreatedCategoryIds');
        if (userCreatedIds) {
          const savedIds = JSON.parse(userCreatedIds);
          const updatedIds = savedIds.filter((id: string) => id !== categoryId);
          localStorage.setItem('userCreatedCategoryIds', JSON.stringify(updatedIds));
        }
        
        // Reload categories
        this.loadCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. Please try again.');
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
    
  }

  filter(category: string): void {
    this.currentCategory = category;
    this.applyFilters();
  }

  private applyFilters(): void {
    if (!this.productList || !this.categories) {
      this.filteredProducts = [];
      return;
    }

    this.filteredProducts = this.currentCategory === 'all'
      ? this.productList
      : this.productList.filter(product => {
          const productCategory = product.category?.name.toLowerCase();
          return productCategory === this.currentCategory.toLowerCase();
        });
  }
}
