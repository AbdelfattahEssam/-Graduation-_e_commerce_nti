import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ILoginData } from '../../core/models/auth.model';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);

  errorMessage = '';
  isLoading = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this._authService.login(this.loginForm.value as ILoginData).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = err.error?.message || 'Something went wrong, please try again';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }
}