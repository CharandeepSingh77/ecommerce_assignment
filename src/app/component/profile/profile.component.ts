import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, UserProfile } from '../../service/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  form: FormGroup;

  constructor(
    private profile: ProfileService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.profile.getProfile().subscribe(data => 
      data && this.form.patchValue(data)
    );
  }

  save() {
    if (this.form.valid) {
      const formValue = this.form.value as UserProfile;
      this.profile.updateProfile(formValue)
        .subscribe(() => this.router.navigate(['/products']));
    }
  }
}
