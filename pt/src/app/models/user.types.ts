export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: Role;
  avatar: string;
  creationAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  role?: Role;
  avatar?: string;
}
