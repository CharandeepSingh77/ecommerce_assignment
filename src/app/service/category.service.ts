import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Category {
  name: string;
  icon: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: Category[] = [];
  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  constructor() {
    // Load categories from localStorage on init
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      this.categories = JSON.parse(savedCategories);
      this.categoriesSubject.next(this.categories);
    }
  }

  getCategories() {
    return this.categoriesSubject.asObservable();
  }

  addCategory(category: Omit<Category, 'id'>) {
    const newCategory = {
      ...category,
      id: Date.now().toString() // Simple way to generate unique ID
    };

    this.categories.push(newCategory);
    this.saveToLocalStorage();
    this.categoriesSubject.next(this.categories);

    return newCategory;
  }

  deleteCategory(categoryId: string) {
    this.categories = this.categories.filter(cat => cat.id !== categoryId);
    this.saveToLocalStorage();
    this.categoriesSubject.next(this.categories);
  }

  // Add update category method
  updateCategory(categoryId: string, updatedCategory: Omit<Category, 'id'>) {
    const index = this.categories.findIndex(cat => cat.id === categoryId);
    if (index !== -1) {
      this.categories[index] = {
        ...this.categories[index],
        ...updatedCategory
      };
      this.saveToLocalStorage();
      this.categoriesSubject.next([...this.categories]);
      return this.categories[index];
    }
    return null;
  }

  private saveToLocalStorage() {
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }
}
