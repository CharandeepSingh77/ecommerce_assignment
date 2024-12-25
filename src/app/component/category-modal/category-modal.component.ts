import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GraphqlService } from '../../service/graphql.service';
import { Category as GraphQLCategory, CreateCategoryInput } from '../../models/graphql.types';
import { firstValueFrom } from 'rxjs';

declare var bootstrap: any;

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrls: ['./category-modal.component.scss']
})
export class CategoryModalComponent implements OnInit {
  @Output() categoryAdded = new EventEmitter<void>();
  @Output() categoryUpdated = new EventEmitter<void>();
  @ViewChild('categoryForm') categoryForm!: NgForm;

  public readonly defaultIcon = 'assets/images/default-category.svg';
  public newCategory: Omit<GraphQLCategory, 'id'>;
  public editingCategory: GraphQLCategory | null = null;
  public categories: GraphQLCategory[] = [];
  private modalInstance: any;

  constructor(private graphqlService: GraphqlService) {
    this.newCategory = {
      name: '',
      image: this.defaultIcon,
      creationAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  ngOnInit(): void {
    this.loadCategories();
    this.initializeModal();
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await firstValueFrom(this.graphqlService.getCategories());
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async saveCategory(): Promise<void> {
    try {
      if (this.newCategory.name.trim()) {
        const categoryName = this.newCategory.name.trim();
        const categoryImage = this.newCategory.image;
        
        if (this.editingCategory) {
          const updatedCategory = {
            ...this.editingCategory,
            name: categoryName,
            image: categoryImage,
            updatedAt: new Date().toISOString()
          };
          await firstValueFrom(this.graphqlService.updateCategory(this.editingCategory.id, updatedCategory));
          this.categoryUpdated.emit();
        } else {
          const newCategory: CreateCategoryInput = {
            name: categoryName,
            image: categoryImage
          };
          await firstValueFrom(this.graphqlService.createCategory(newCategory));
          this.categoryAdded.emit();
          this.newCategory = {
            name: '',
            image: this.defaultIcon,
            creationAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        this.modalInstance.hide();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  }

  openModal(category?: GraphQLCategory): void {
    if (category) {
      this.editingCategory = category;
      this.newCategory = {
        name: category.name,
        image: category.image,
        creationAt: category.creationAt,
        updatedAt: new Date().toISOString()
      };
    } else {
      this.editingCategory = null;
      this.newCategory = {
        name: '',
        image: this.defaultIcon,
        creationAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    this.modalInstance.show();
  }

  private initializeModal(): void {
    try {
      const categoryModalEl = document.getElementById('categoryModal');
      if (categoryModalEl) {
        this.modalInstance = new bootstrap.Modal(categoryModalEl, {
          keyboard: true,
          backdrop: true,
          focus: true
        });
      }
    } catch (error) {
      console.error('Error initializing modal:', error);
    }
  }

  closeModal(): void {
    this.modalInstance?.hide();
  }
}
