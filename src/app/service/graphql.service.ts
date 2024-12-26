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
  UpdateCategoryInput
} from '../models/graphql.types';
import { User, UpdateUserDto } from '../models/user.types';
import { UPDATE_USER_MUTATION } from '../graphql/auth.graphql';
import {
  GET_CATEGORIES,
  GET_CATEGORY,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY
} from '../graphql/category.graphql';

const PRODUCT_FRAGMENT = gql`
  fragment ProductFields on Product {
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
`;

@Injectable({
  providedIn: 'root',
})
export class GraphqlService {
  constructor(private apollo: Apollo) {}

  // Product Operations
  getProducts(filters?: ProductFilters): Observable<Product[]> {
    return this.apollo
      .query<{ products: Product[] }>({
        query: gql`
          ${PRODUCT_FRAGMENT}
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
              ...ProductFields
            }
          }
        `,
        variables: filters || {},
        fetchPolicy: 'network-only'
      })
      .pipe(map((result) => result.data.products));
  }

  getProduct(id: string): Observable<Product> {
    return this.apollo
      .query<{ product: Product }>({
        query: gql`
          ${PRODUCT_FRAGMENT}
          query GetProduct($id: ID!) {
            product(id: $id) {
              ...ProductFields
            }
          }
        `,
        variables: { id },
      })
      .pipe(map((result) => result.data.product));
  }

  addProduct(data: CreateProductInput): Observable<Product> {
    return this.apollo
      .mutate<{ addProduct: Product }>({
        mutation: gql`
          ${PRODUCT_FRAGMENT}
          mutation AddProduct($data: CreateProductDto!) {
            addProduct(data: $data) {
              ...ProductFields
            }
          }
        `,
        variables: { data },
        refetchQueries: [
          {
            query: gql`
              ${PRODUCT_FRAGMENT}
              query GetProducts {
                products {
                  ...ProductFields
                }
              }
            `
          }
        ]
      })
      .pipe(map((result) => result.data!.addProduct));
  }

  updateProduct(id: string, changes: UpdateProductInput): Observable<Product> {
    return this.apollo
      .mutate<{ updateProduct: Product }>({
        mutation: gql`
          ${PRODUCT_FRAGMENT}
          mutation UpdateProduct($id: ID!, $changes: UpdateProductDto!) {
            updateProduct(id: $id, changes: $changes) {
              ...ProductFields
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

  // Category Operations
  getCategories(): Observable<Category[]> {
    return this.apollo
      .query<{ categories: Category[] }>({
        query: GET_CATEGORIES,
        fetchPolicy: 'network-only'
      })
      .pipe(map((result) => result.data.categories));
  }

  getCategory(id: string): Observable<Category> {
    return this.apollo
      .query<{ category: Category }>({
        query: GET_CATEGORY,
        variables: { id }
      })
      .pipe(map((result) => result.data.category));
  }

  createCategory(data: CreateCategoryInput): Observable<Category> {
    return this.apollo
      .mutate<{ addCategory: Category }>({
        mutation: CREATE_CATEGORY,
        variables: { data },
        refetchQueries: [{ query: GET_CATEGORIES }]
      })
      .pipe(map((result) => result.data!.addCategory));
  }

  updateCategory(id: string, changes: UpdateCategoryInput): Observable<Category> {
    return this.apollo
      .mutate<{ updateCategory: Category }>({
        mutation: UPDATE_CATEGORY,
        variables: { id, changes },
        refetchQueries: [{ query: GET_CATEGORIES }]
      })
      .pipe(map((result) => result.data!.updateCategory));
  }

  deleteCategory(id: string): Observable<boolean> {
    const numericId = parseInt(id);
    const finalId = isNaN(numericId) ? id : numericId;

    return this.apollo
      .mutate<{ deleteCategory: boolean }>({
        mutation: DELETE_CATEGORY,
        variables: { id: finalId },
        refetchQueries: [{ query: GET_CATEGORIES }],
        update: (cache) => {
          const normalizedId = cache.identify({ id: finalId, __typename: 'Category' });
          if (normalizedId) {
            cache.evict({ id: normalizedId });
            cache.gc();
          }
        }
      })
      .pipe(
        map((result) => result.data?.deleteCategory ?? false),
        catchError(() => new Observable<boolean>(observer => observer.next(false)))
      );
  }

  // User Operations
  getUser(id: string): Observable<User> {
    return this.apollo
      .query<{ user: User }>({
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
          if (error.graphQLErrors?.length > 0) {
            throw new Error(error.graphQLErrors.map((e: any) => e.message).join(', '));
          }
          throw new Error('Failed to update profile. Please try again.');
        })
      );
  }
}
