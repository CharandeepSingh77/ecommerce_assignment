import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { Category as GraphQLCategory, CreateCategoryInput } from '../../models/graphql.types';
import { GraphqlService } from '../../service/graphql.service';
import { NgForm } from '@angular/forms';

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
    setTimeout(() => {
      this.initializeModal();
    }, 1000);
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

  loadCategories(): void {
    this.graphqlService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error: Error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  public openModal(category?: GraphQLCategory): void {
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
    this.modalInstance?.show();
  }

  public closeModal(): void {
    this.modalInstance?.hide();
  }

  saveCategory(): void {
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
        
        this.graphqlService.updateCategory(this.editingCategory.id, updatedCategory).subscribe({
          next: () => {
            this.categoryUpdated.emit();
            this.closeModal();
          },
          error: (error: Error) => {
            console.error('Error updating category:', error);
          }
        });
      } else {

        const newCategory: CreateCategoryInput = {
          name: categoryName,
          image: categoryImage
        };
        
        this.graphqlService.createCategory(newCategory).subscribe({
          next: () => {
            this.categoryAdded.emit();
            this.closeModal();
      
            this.newCategory = {
              name: '',
              image: this.defaultIcon,
              creationAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          },
          error: (error: Error) => {
            console.error('Error creating category:', error);
          }
        });
      }
    }
  }
}
