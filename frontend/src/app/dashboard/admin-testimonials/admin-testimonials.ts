import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TestimonialService } from '../../core/services/testimonial.service';
import { IAdminTestimonial } from '../../core/models/testimonial.model';

@Component({
  imports: [DatePipe],
  selector: 'app-admin-testimonials',
  styleUrl: './admin-testimonials.css',
  templateUrl: './admin-testimonials.html',
})
export class AdminTestimonials implements OnInit {

  private _testimonialService = inject(TestimonialService);
  private _cdr = inject(ChangeDetectorRef);

  testimonials: IAdminTestimonial[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  statuses = ['pending', 'approved', 'rejected'];
  statusFilter = 'pending';
  stars = [1, 2, 3, 4, 5];

  page = 1;
  total = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.isLoading = true;
    this._testimonialService.getAllAdmin(this.page, 10, this.statusFilter).subscribe({
      next: (res) => {
        this.testimonials = res.data.testimonials;
        this.total = res.data.total;
        this.totalPages = res.data.totalPages;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load testimonials';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  onFilterChange(event: Event) {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.load();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  setStatus(t: IAdminTestimonial, status: string) {
    this.errorMessage = '';
    this.successMessage = '';

    this._testimonialService.updateStatus(t._id, status).subscribe({
      next: () => {
        this.successMessage = `Testimonial from ${t.userId.name} is now "${status}"`;
        if (this.testimonials.length === 1 && this.page > 1) this.page--;
        this.load();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update the status';
        this._cdr.detectChanges();
      }
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-danger';
      default: return 'bg-warning text-dark';
    }
  }
}