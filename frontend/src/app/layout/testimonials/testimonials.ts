import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TestimonialService } from '../../core/services/testimonial.service';
import { AuthService } from '../../core/services/auth.service';
import { ITestimonial } from '../../core/models/testimonial.model';

@Component({
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  selector: 'app-testimonials',
  styleUrl: './testimonials.css',
  templateUrl: './testimonials.html',
})
export class Testimonials implements OnInit {

  private _testimonialService = inject(TestimonialService);
  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);

  testimonials: ITestimonial[] = [];
  isLoading = true;
  errorMessage = '';

  isLoggedIn = false;
  isSending = false;
  successMessage = '';
  formError = '';

  stars = [1, 2, 3, 4, 5];

  form = new FormGroup({
    rating: new FormControl(0, [Validators.min(1), Validators.max(5)]),
    content: new FormControl('', [Validators.required, Validators.maxLength(500)])
  });

  ngOnInit(): void {
    this.isLoggedIn = this._authService.isLoggedIn();

    this._testimonialService.getApproved().subscribe({
      next: (res) => {
        this.testimonials = res.data.testimonials;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load reviews';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  setRating(value: number) {
    this.form.controls.rating.setValue(value);
    this.form.controls.rating.markAsTouched();
  }

  get rating(): number {
    return this.form.controls.rating.value ?? 0;
  }

  send() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSending = true;
    this.successMessage = '';
    this.formError = '';

    const { rating, content } = this.form.value;

    this._testimonialService.create({ rating: rating ?? 0, content: content ?? '' }).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.form.reset({ rating: 0, content: '' });
        this.isSending = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.formError = err.error?.message || 'Failed to send your review';
        this.isSending = false;
        this._cdr.detectChanges();
      }
    });
  }
}