import { Component, OnInit } from '@angular/core';
import { AuthService } from './service/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Clear any existing login state on app start
    if (!this.authService.isAuthenticated()) {
      localStorage.removeItem('isLoggedIn');
      this.router.navigate(['/register']);
    }

    // Subscribe to login state changes
    this.authService.loginState$.subscribe(
      (loggedIn: boolean) => {
        this.isLoggedIn = loggedIn;
        if (!loggedIn) {
          this.router.navigate(['/register']);
        }
      }
    );

    // Update login state on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isLoggedIn = this.authService.isAuthenticated();
    });
  }
}
