import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { IAdminUser } from '../../core/models/admin.model';

@Component({
  imports: [ReactiveFormsModule, DatePipe],
  selector: 'app-admin-users',
  styleUrl: './admin-users.css',
  templateUrl: './admin-users.html',
})
export class AdminUsers implements OnInit {

  private _adminService = inject(AdminService);
  private _cdr = inject(ChangeDetectorRef);

  users: IAdminUser[] = [];
  search = new FormControl('');

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  page = 1;
  total = 0;
  totalPages = 0;

  showAdminForm = false;
  isCreating = false;
  adminError = '';

  adminForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.isLoading = true;
    this._adminService.getUsers(this.page, 10, this.search.value ?? '').subscribe({
      next: (res) => {
        this.users = res.data.users;
        this.total = res.data.total;
        this.totalPages = res.data.totalPages;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load users';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  doSearch() {
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

  toggleBlock(user: IAdminUser) {
    const block = !user.isBlocked;
    if (block && !confirm(`Block ${user.name}? They will not be able to use the store.`)) return;

    this.errorMessage = '';
    this.successMessage = '';

    this._adminService.setBlocked(user._id, block).subscribe({
      next: (res) => {
        user.isBlocked = res.data.user.isBlocked;
        this.successMessage = `${user.name} is now ${user.isBlocked ? 'blocked' : 'unblocked'}`;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update the user';
        this._cdr.detectChanges();
      }
    });
  }

  // ---------- Create admin ----------
  openAdminForm() {
    this.adminError = '';
    this.adminForm.reset({ name: '', email: '', password: '' });
    this.showAdminForm = true;
  }

  closeAdminForm() {
    this.showAdminForm = false;
  }

  createAdmin() {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      return;
    }

    this.isCreating = true;
    this.adminError = '';
    this.successMessage = '';

    const v = this.adminForm.value;

    this._adminService.createAdmin({
      name: v.name ?? '',
      email: v.email ?? '',
      password: v.password ?? ''
    }).subscribe({
      next: (res) => {
        this.isCreating = false;
        this.showAdminForm = false;
        this.successMessage = `Admin "${res.data.admin.name}" was created`;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.adminError = err.error?.message || 'Failed to create the admin';
        this.isCreating = false;
        this._cdr.detectChanges();
      }
    });
  }
}