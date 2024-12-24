import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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

  login(email: string, password: string): Observable<boolean> {
    return this.apollo.mutate<{ login: Login }>({
      mutation: LOGIN_MUTATION,
      variables: { email, password }
    }).pipe(
      map(result => {
        if (result.data?.login) {
          this.setTokens(result.data.login);
          this.loginState.next(true);
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: Omit<CreateUserDto, 'avatar'>): Observable<User> {
    console.log('Auth Service - Registration data:', userData);
   
    const userDataWithAvatar: CreateUserDto = {
      ...userData,
      avatar: 'https://api.lorem.space/image/face?w=150&h=150'
    };

    return this.apollo.mutate<{ addUser: User }>({
      mutation: REGISTER_MUTATION,
      variables: { 
        data: userDataWithAvatar
      }
    }).pipe(
      map(result => {
        console.log('Registration response:', result);
        if (result.data?.addUser) {
          localStorage.setItem(this.USER_KEY, JSON.stringify(result.data.addUser));
          return result.data.addUser;
        }
        throw new Error('Registration failed');
      }),
      catchError(error => {
        console.error('Registration error in service:', error);
        return throwError(() => error);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.loginState.next(false);
    this.apollo.client.resetStore();
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<Login> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.apollo.mutate<{ refreshToken: Login }>({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { refreshToken }
    }).pipe(
      map(result => {
        if (result.data?.refreshToken) {
          this.setTokens(result.data.refreshToken);
          return result.data.refreshToken;
        }
        throw new Error('Token refresh failed');
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private setTokens(login: Login) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, login.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, login.refresh_token);
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getUserId(): string | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }
}
