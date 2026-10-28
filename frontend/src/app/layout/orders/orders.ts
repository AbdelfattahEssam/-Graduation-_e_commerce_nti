import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { IOrder } from '../../core/models/order.model';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-orders',
  styleUrl: './orders.css',
  templateUrl: './orders.html',
})
export class Orders implements OnInit {

  private _orderService = inject(OrderService);
  private _cdr = inject(ChangeDetectorRef);

  orders: IOrder[] = [];
  isLoading = true;
  errorMessage = '';

  page = 1;
  totalPages = 0;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this._orderService.getMyOrders(this.page).subscribe({
      next: (res) => {
        this.orders = res.data.orders;
        this.totalPages = res.data.totalPages;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load orders';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.loadOrders();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  statusClass(status: string): string {
    switch (status) {
      case 'pending': return 'bg-warning text-dark';
      case 'preparing': return 'bg-info text-dark';
      case 'shipped': return 'bg-primary';
      case 'delivered':
      case 'received': return 'bg-success';
      case 'refunded': return 'bg-secondary';
      default: return 'bg-danger';
    }
  }
}