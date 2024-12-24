import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map, catchError } from 'rxjs';
import {
  Product,
  Category,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../models/graphql.types';
import { User, UpdateUserDto } from '../models/user.types';
import { UPDATE_USER_MUTATION } from '../graphql/auth.graphql';

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  private localCategories: Category[] = [{
    id: 'default_electronics',
    name: 'electronics',
    image: 'https://cdn-icons-png.flaticon.com/512/3659/3659899.png',
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }];

  constructor(private apollo: Apollo) {
    // Load local categories from localStorage, keeping the default electronics category
    const savedCategories = localStorage.getItem('local_categories');
    if (savedCategories) {
      const parsedCategories = JSON.parse(savedCategories);
      // Ensure electronics category is always first
      this.localCategories = [
        this.localCategories[0],
        ...parsedCategories.filter((cat: Category) => cat.id !== 'default_electronics')
      ];
    }
    // Always save to ensure electronics category exists
    localStorage.setItem('local_categories', JSON.stringify(this.localCategories));
  }

  // Product Queries
  getProducts(filters?: ProductFilters): Observable<Product[]> {
    return this.apollo
      .query<{ products: Product[] }>({
        query: gql`
          query GetProducts(
            $limit: Int
            $offset: Int
            $price: Int
            $price_min: Int
            $price_max: Int
            $title: String
            $categoryId: Float
          ) {
            products(
              limit: $limit
              offset: $offset
              price: $price
              price_min: $price_min
              price_max: $price_max
              title: $title
              categoryId: $categoryId
            ) {
              id
              title
              price
              description
              images
              category {
                id
                name
                image
              }
              creationAt
              updatedAt
            }
          }
        `,
        variables: filters || {},
        fetchPolicy: 'network-only' // Force fetch from network
      })
      .pipe(map((result) => result.data.products));
  }

  getProduct(id: string): Observable<Product> {
    return this.apollo
      .query<{ product: Product }>({
        query: gql`
          query GetProduct($id: ID!) {
            product(id: $id) {
              id
              title
              price
              description
              images
              creationAt
              updatedAt
              category {
                id
                name
                image
              }
            }
          }
        `,
        variables: { id },
      })
      .pipe(map((result) => result.data.product));
  }

  // Product Mutations
  addProduct(data: CreateProductInput): Observable<Product> {
    return this.apollo
      .mutate<{ addProduct: Product }>({
        mutation: gql`
          mutation AddProduct($data: CreateProductDto!) {
            addProduct(data: $data) {
              id
              title
              price
              description
              images
              category {
                id
                name
                image
              }
              creationAt
              updatedAt
            }
          }
        `,
        variables: { data },
        refetchQueries: [
          {
            query: gql`
              query GetProducts {
                products {
                  id
                  title
                  price
                  description
                  images
                  category {
                    id
                    name
                    image
                  }
                  creationAt
                  updatedAt
                }
              }
            `
          }
        ]
      })
      .pipe(
        map((result) => {
          if (!result.data?.addProduct) {
            throw new Error('Failed to add product');
          }
          return result.data.addProduct;
        })
      );
  }

  updateProduct(id: string, changes: UpdateProductInput): Observable<Product> {
    return this.apollo
      .mutate<{ updateProduct: Product }>({
        mutation: gql`
          mutation UpdateProduct($id: ID!, $changes: UpdateProductDto!) {
            updateProduct(id: $id, changes: $changes) {
              id
              title
              price
              description
              images
              category {
                id
                name
                image
              }
              creationAt
              updatedAt
            }
          }
        `,
        variables: { id, changes },
      })
      .pipe(map((result) => result.data!.updateProduct));
  }

  deleteProduct(id: string): Observable<boolean> {
    return this.apollo
      .mutate<{ deleteProduct: boolean }>({
        mutation: gql`
          mutation DeleteProduct($id: ID!) {
            deleteProduct(id: $id)
          }
        `,
        variables: { id },
      })
      .pipe(map((result) => result.data!.deleteProduct));
  }

  // Category Queries
  getCategories(): Observable<Category[]> {
    return new Observable<Category[]>(observer => {
      observer.next(this.localCategories);
      observer.complete();
    });
  }

  getCategory(id: string): Observable<Category> {
    return new Observable<Category>(observer => {
      const category = this.localCategories.find(c => c.id === id);
      if (category) {
        observer.next(category);
      } else {
        observer.error(new Error('Category not found'));
      }
      observer.complete();
    });
  }

  // Category Mutations
  createCategory(data: CreateCategoryInput): Observable<Category> {
    return new Observable<Category>(observer => {
      const newCategory: Category = {
        id: 'local_' + Date.now(),
        ...data,
        creationAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Add new category after electronics
      this.localCategories.push(newCategory);
      localStorage.setItem('local_categories', JSON.stringify(this.localCategories));
      
      observer.next(newCategory);
      observer.complete();
    });
  }

  updateCategory(id: string, changes: UpdateCategoryInput): Observable<Category> {
    return new Observable<Category>(observer => {
      // Prevent editing electronics category
      if (id === 'default_electronics') {
        observer.error(new Error('Cannot modify default electronics category'));
        return;
      }

      const index = this.localCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        const updatedCategory = {
          ...this.localCategories[index],
          ...changes,
          updatedAt: new Date().toISOString()
        };
        this.localCategories[index] = updatedCategory;
        localStorage.setItem('local_categories', JSON.stringify(this.localCategories));
        observer.next(updatedCategory);
      } else {
        observer.error(new Error('Category not found'));
      }
      observer.complete();
    });
  }

  deleteCategory(id: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      const index = this.localCategories.findIndex(c => c.id === id);
      if (index !== -1) {
        this.localCategories.splice(index, 1);
        localStorage.setItem('local_categories', JSON.stringify(this.localCategories));
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  // User Queries
  getUser(id: string): Observable<any> {
    return this.apollo
      .query<{ user: any }>({
        query: gql`
          query GetUser($id: ID!) {
            user(id: $id) {
              id
              name
              email
              phone
              address
              avatar
            }
          }
        `,
        variables: { id },
      })
      .pipe(map((result) => result.data.user));
  }

  // User Mutations
  updateUser(id: string, changes: { data: UpdateUserDto }): Observable<User> {
    return this.apollo
      .mutate<{ updateUser: User }>({
        mutation: UPDATE_USER_MUTATION,
        variables: { 
          id,
          changes: {
            name: changes.data.name,
            email: changes.data.email
          }
        },
      })
      .pipe(
        map((result) => {
          if (!result.data?.updateUser) {
            throw new Error('Failed to update user profile');
          }
          return result.data.updateUser;
        }),
        catchError(error => {
          console.error('GraphQL Error:', error);
          if (error.graphQLErrors?.length > 0) {
            const message = error.graphQLErrors.map((e: any) => e.message).join(', ');
            throw new Error(message);
          }
          throw new Error('Failed to update profile. Please try again.');
        })
      );
  }
}
