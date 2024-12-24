import { gql } from '@apollo/client/core';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      access_token
      refresh_token
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation AddUser($data: CreateUserDto!) {
    addUser(data: $data) {
      id
      email
      name
      role
      avatar
      creationAt
      updatedAt
    }
  }
`;

export const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      access_token
      refresh_token
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $changes: UpdateUserDto!) {
    updateUser(id: $id, changes: $changes) {
      id
      email
      name
      role
      avatar
      creationAt
      updatedAt
    }
  }
`;
