import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService, UserProfile } from '../../service/profile.service';
import { firstValueFrom } from 'rxjs';

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

    this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    try {
      const profileData = await firstValueFrom(this.profile.getProfile());
      if (profileData) {
        this.form.patchValue(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  async save(): Promise<void> {
    if (this.form.valid) {
      try {
        const formValue = this.form.value as UserProfile;
        const updatedProfile = await firstValueFrom(this.profile.updateProfile(formValue));
        if (updatedProfile) {
          await this.router.navigate(['/products']);
        }
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  }
}
