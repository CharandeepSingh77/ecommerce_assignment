import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { LOGIN_MUTATION, REGISTER_MUTATION, REFRESH_TOKEN_MUTATION } from '../graphql/auth.graphql';
import { User, Login, CreateUserDto } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';
  
  private loginState = new BehaviorSubject<boolean>(false);
  loginState$ = this.loginState.asObservable();

  constructor(
    private router: Router,
    private apollo: Apollo
  ) {
    this.loginState.next(!!this.getAccessToken());
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const result = await firstValueFrom(this.apollo.mutate<{ login: Login }>({
        mutation: LOGIN_MUTATION,
        variables: { email, password }
      }));

      if (result.data?.login) {
        this.setTokens(result.data.login);
        this.loginState.next(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: Omit<CreateUserDto, 'avatar'>): Promise<User> {
    console.log('Auth Service - Registration data:', userData);
   
    const userDataWithAvatar: CreateUserDto = {
      ...userData,
      avatar: 'https://api.lorem.space/image/face?w=640&h=480'
    };

    try {
      const result = await firstValueFrom(this.apollo.mutate<{ addUser: User }>({
        mutation: REGISTER_MUTATION,
        variables: { data: userDataWithAvatar }
      }));

      if (!result.data?.addUser) {
        throw new Error('Registration failed');
      }

      return result.data.addUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.loginState.next(false);
    this.router.navigate(['/login']);
  }

  async refreshToken(): Promise<Login> {
    try {
      const result = await firstValueFrom(this.apollo.mutate<{ refreshToken: Login }>({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { refreshToken: this.getRefreshToken() }
      }));

      if (!result.data?.refreshToken) {
        throw new Error('Token refresh failed');
      }

      this.setTokens(result.data.refreshToken);
      return result.data.refreshToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUserId(): string | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user).id : null;
  }

  private setTokens(login: Login) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, login.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, login.refresh_token);
    if (login.user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(login.user));
    }
  }
}
