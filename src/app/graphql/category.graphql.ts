import { gql } from 'apollo-angular';

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      image
      creationAt
      updatedAt
    }
  }
`;

export const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
      image
      creationAt
      updatedAt
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($data: CreateCategoryDto!) {
    addCategory(data: $data) {
      id
      name
      image
      creationAt
      updatedAt
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $changes: UpdateCategoryDto!) {
    updateCategory(id: $id, changes: $changes) {
      id
      name
      image
      creationAt
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;
