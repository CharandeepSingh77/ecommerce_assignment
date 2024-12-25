import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login() {
    if (this.form.valid) {
      try {
        const { email, password } = this.form.value;
        const success = await this.auth.login(email, password);
        if (success) {
          await this.router.navigate(['/products']);
        } else {
          this.error = 'Invalid credentials';
        }
      } catch (err: any) {
        this.error = err.message || 'Login failed';
      }
    }
  }
}
