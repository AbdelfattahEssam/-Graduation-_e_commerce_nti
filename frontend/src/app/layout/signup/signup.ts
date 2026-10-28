import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ISignupData } from '../../core/models/auth.model';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-signup',
  styleUrl: './signup.css',
  templateUrl: './signup.html',
})
export class Signup {

  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);

  errorMessage = '';
  isLoading = false;

  signupForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required])
  }, { validators: this.passwordsMatch });

  passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.signupForm.value;

    this._authService.signup({ name, email, password } as ISignupData).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Something went wrong, please try again';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }
}