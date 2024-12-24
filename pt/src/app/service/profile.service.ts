import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GraphqlService } from './graphql.service';
import { AuthService } from './auth.service';

export interface UserProfile {
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(
    private graphqlService: GraphqlService,
    private authService: AuthService
  ) {}

  getProfile(): Observable<UserProfile | null> {
    const userId = this.authService.getUserId();
    if (!userId) return of(null);
    return this.graphqlService.getUser(userId);
  }

  updateProfile(profile: UserProfile): Observable<UserProfile> {
    const userId = this.authService.getUserId();
    if (!userId) return of(profile);
    return this.graphqlService.updateUser(userId, { data: profile });
  }
}
