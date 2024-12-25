export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  creationAt: Date;
  updatedAt: Date;
}

export interface Login {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  avatar: string;
}
