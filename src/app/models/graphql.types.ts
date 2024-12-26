export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: Category;
  images: string[];
  creationAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  creationAt: string;
  updatedAt: string;
  products?: Product[];
}

export interface ProductFilters {
  limit?: number;
  offset?: number;
  price?: number;
  price_min?: number;
  price_max?: number;
  title?: string;
  categoryId?: number;
}

export interface CreateProductInput {
  title: string;
  price: number;
  description: string;
  categoryId: number;  
  images: string[];
}

export interface UpdateProductInput {
  title?: string;
  price?: number;
  description?: string;
  categoryId?: number;  
  images?: string[];
}

export interface CreateCategoryInput {
  name: string;
  image: string;
}

export interface UpdateCategoryInput {
  name?: string;
  image?: string;
  description?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  cartItemId: string;
  quantity: number;
}
