import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GraphqlService } from '../../service/graphql.service';
import { CreateProductInput, Category } from '../../models/graphql.types';
import { finalize } from 'rxjs/operators';

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
  loading = false;
  error = '';
  imagePreview = '';

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

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.form.patchValue({ image: this.imagePreview });
    };
    reader.readAsDataURL(file);
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const { title, price, description, categoryId, image } = this.form.value;
    
    const product = {
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

    this.saveToLocalStorage(product);
    this.resetForm();
    this.productAdded.emit();
    this.toggleForm();
    this.loading = false;
  }

  private loadCategories(): void {
    this.loading = true;
    this.graphql.getCategories()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: categories => this.categories = categories,
        error: () => this.error = 'Failed to load categories'
      });
  }

  private resetForm(): void {
    this.form.reset();
    this.imagePreview = this.error = '';
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  private saveToLocalStorage(product: any): void {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    localStorage.setItem('products', JSON.stringify([...products, product]));
  }
}
