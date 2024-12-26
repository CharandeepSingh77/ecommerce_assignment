import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GraphqlService } from '../../service/graphql.service';
import { CreateProductInput, Category } from '../../models/graphql.types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  @Output() productAdded = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  showForm = false;
  categories: Category[] = [];
  error = '';

  constructor(private fb: FormBuilder, private graphql: GraphqlService) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      categoryId: ['', Validators.required],
      image: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await firstValueFrom(this.graphql.getCategories());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      this.form.patchValue({ image: reader.result as string });
    };
    reader.readAsDataURL(file);
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.error = '';
    const { title, price, description, categoryId, image } = this.form.value;
    
    const productInput: CreateProductInput = {
      title,
      price: Number(price),
      description,
      categoryId: Number(categoryId),
      images: [image]
    };

    try {
      await firstValueFrom(this.graphql.addProduct(productInput));
      this.resetForm();
      this.productAdded.emit();
      this.toggleForm();
    } catch (error: any) {
      console.error('Failed to add product to API:', error);
      
      try {
        const localProduct = {
          id: `local_${Date.now()}`,
          title,
          price: Number(price),
          description,
          categoryId: Number(categoryId),
          images: [image],
          image,
          category: this.categories.find(cat => cat.id === categoryId),
          createdAt: new Date().toISOString()
        };

        this.saveToLocalStorage(localProduct);
        this.resetForm();
        this.productAdded.emit();
        this.toggleForm();
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
        this.error = 'Failed to add product. Please try again.';
      }
    }
  }

  private saveToLocalStorage(product: any): void {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      products.push(product);
      localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw error;
    }
  }

  resetForm(): void {
    this.form.reset();
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.error = '';
  }
}
