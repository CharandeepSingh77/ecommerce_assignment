import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category } from '../models/graphql.types';
import { GraphqlService } from './graphql.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private categories: Category[] = [];
  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  constructor(private graphqlService: GraphqlService) {
    this.loadCategories();
  }

  loadCategories() {
    this.graphqlService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoriesSubject.next(this.categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  refreshCategories() {
    this.loadCategories();
  }

  getCategories(): Observable<Category[]> {
    return this.categoriesSubject.asObservable();
  }

  async addCategory(category: Omit<Category, 'id' | 'creationAt' | 'updatedAt'>) {
    try {
      const newCategory = await this.graphqlService.createCategory({
        name: category.name,
        image: category.image
      }).toPromise();
      if (newCategory) {
        this.categories.push(newCategory);
        this.categoriesSubject.next(this.categories);
      }
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  async updateCategory(categoryId: string, updatedCategory: Omit<Category, 'id' | 'creationAt' | 'updatedAt'>) {
    try {
      const updated = await this.graphqlService.updateCategory(categoryId, {
        name: updatedCategory.name,
        image: updatedCategory.image
      }).toPromise();
      if (updated) {
        const index = this.categories.findIndex(c => c.id === categoryId);
        if (index !== -1) {
          this.categories[index] = updated;
          this.categoriesSubject.next(this.categories);
        }
      }
      return updated;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId: string) {
    try {
      const deleted = await this.graphqlService.deleteCategory(categoryId).toPromise();
      if (deleted) {
        this.categories = this.categories.filter(c => c.id !== categoryId);
        this.categoriesSubject.next(this.categories);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}
