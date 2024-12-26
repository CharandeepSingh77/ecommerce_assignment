import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GraphqlService } from '../../service/graphql.service';
import { Category as GraphQLCategory, CreateCategoryInput, UpdateCategoryInput } from '../../models/graphql.types';
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

  public newCategory: GraphQLCategory = {
    id: '',  // Required by type, will be set by API
    name: '',
    image: '',
    creationAt: '',  // Required by type, will be set by API
    updatedAt: ''    // Required by type, will be set by API
  };
  public editingCategory: GraphQLCategory | null = null;
  public modalTitle: string = 'Add New Category';

  private modalInstance: any;
  private readonly defaultIcons = [
    'https://cdn-icons-png.flaticon.com/512/3659/3659899.png',
    'https://cdn-icons-png.flaticon.com/512/3659/3659900.png',
    'https://cdn-icons-png.flaticon.com/512/3659/3659904.png',
    'https://cdn-icons-png.flaticon.com/512/3659/3659905.png',
    'https://cdn-icons-png.flaticon.com/512/3659/3659906.png'
  ];

  constructor(private graphqlService: GraphqlService) {}

  ngOnInit(): void {
    this.initializeModal();
    this.resetForm();
  }

  public async saveCategory(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    try {
      if (this.editingCategory) {
        await this.updateExistingCategory();
      } else {
        await this.createNewCategory();
      }
      this.closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  }

  public openModal(category?: GraphQLCategory): void {
    if (category) {
      this.setupEditMode(category);
    } else {
      this.setupCreateMode();
    }
    this.modalInstance?.show();
  }

  public closeModal(): void {
    this.modalInstance?.hide();
    this.resetForm();
  }

  private isFormValid(): boolean {
    const name = this.newCategory.name;
    return name !== undefined && name.trim().length > 0;
  }

  private async updateExistingCategory(): Promise<void> {
    if (!this.editingCategory) {
      throw new Error('No category selected for editing');
    }

    const changes: { name: string; image?: string } = {
      name: this.newCategory.name.trim()
    };

    if (this.newCategory.image !== this.editingCategory.image) {
      changes.image = this.newCategory.image;
    }

    await firstValueFrom(
      this.graphqlService.updateCategory(this.editingCategory.id, changes)
    );

    this.categoryUpdated.emit();
  }

  private async createNewCategory(): Promise<void> {
    const categoryData = {
      name: this.newCategory.name.trim(),
      image: this.newCategory.image || this.getRandomIcon()
    };

    const result = await firstValueFrom(this.graphqlService.createCategory(categoryData));
    
    // Store only the ID in localStorage to track user-created categories
    const userCreatedIds = localStorage.getItem('userCreatedCategoryIds') || '[]';
    const savedIds = JSON.parse(userCreatedIds);
    savedIds.push(result.id);
    localStorage.setItem('userCreatedCategoryIds', JSON.stringify(savedIds));
    
    this.categoryAdded.emit();
  }

  private setupEditMode(category: GraphQLCategory): void {
    this.editingCategory = { ...category };
    this.newCategory = {
      ...category,
      name: category.name,
      image: category.image || this.getRandomIcon()
    };
    this.modalTitle = 'Edit Category';
  }

  private setupCreateMode(): void {
    this.editingCategory = null;
    this.resetForm();
    this.modalTitle = 'Add New Category';
  }

  private resetForm(): void {
    this.newCategory = {
      id: '',  // Required by type, will be set by API
      name: '',
      image: this.getRandomIcon(),
      creationAt: '',  // Required by type, will be set by API
      updatedAt: ''    // Required by type, will be set by API
    };

    if (this.categoryForm) {
      this.categoryForm.resetForm(this.newCategory);
    }
  }

  private getRandomIcon(): string {
    const randomIndex = Math.floor(Math.random() * this.defaultIcons.length);
    return this.defaultIcons[randomIndex];
  }

  private initializeModal(): void {
    const modalElement = document.getElementById('categoryModal');
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement, {
        keyboard: false,
        backdrop: 'static'
      });
    }
  }
}
