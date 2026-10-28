import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { IStats } from '../../core/models/admin.model';

@Component({
  imports: [],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {

  private _adminService = inject(AdminService);
  private _cdr = inject(ChangeDetectorRef);

  stats: IStats | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this._adminService.getStats().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load stats';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }
}