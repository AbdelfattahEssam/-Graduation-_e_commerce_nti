import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { IAdminOrder, IOrderProductRef } from '../../core/models/order.model';

@Component({
  imports: [DatePipe],
  selector: 'app-admin-orders',
  styleUrl: './admin-orders.css',
  templateUrl: './admin-orders.html',
})
export class AdminOrders implements OnInit {

  private _orderService = inject(OrderService);
  private _cdr = inject(ChangeDetectorRef);

  orders: IAdminOrder[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  page = 1;
  totalPages = 0;
  total = 0;
  statusFilter = '';
  expandedId: string | null = null;
  updatingId: string | null = null;

  statuses = [
    'pending',
    'preparing',
    'shipped',
    'delivered',
    'received',
    'cancelled by admin',
    'cancelled by client',
    'rejected',
    'refunded'
  ];

  // نفس الانتقالات المسموحة في الباك إند
  private transitions: { [key: string]: string[] } = {
    'pending': ['preparing', 'cancelled by admin', 'rejected'],
    'preparing': ['shipped', 'cancelled by admin'],
    'shipped': ['delivered'],
    'delivered': ['received', 'refunded'],
    'received': ['refunded']
  };

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.isLoading = true;
    this._orderService.getAllOrders(this.page, 10, this.statusFilter).subscribe({
      next: (res) => {
        this.orders = res.data.orders;
        this.total = res.data.total;
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

  onFilterChange(event: Event) {
    this.statusFilter = (event.target as HTMLSelectElement).value;
    this.page = 1;
    this.expandedId = null;
    this.load();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.expandedId = null;
    this.load();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  toggle(id: string) {
    this.expandedId = this.expandedId === id ? null : id;
  }

  nextStatuses(order: IAdminOrder): string[] {
    return this.transitions[order.status] || [];
  }

  changeStatus(order: IAdminOrder, status: string) {
    const risky = status === 'cancelled by admin' || status === 'rejected' || status === 'refunded';
    if (risky && !confirm(`Change order #${order._id.slice(-6)} to "${status}"?`)) return;

    this.updatingId = order._id;
    this.errorMessage = '';
    this.successMessage = '';

    this._orderService.updateStatus(order._id, status).subscribe({
      next: () => {
        this.updatingId = null;
        this.successMessage = `Order #${order._id.slice(-6)} is now "${status}"`;
        this.load();
      },
      error: (err) => {
        this.updatingId = null;
        this.errorMessage = err.error?.message || 'Failed to update the status';
        this._cdr.detectChanges();
      }
    });
  }

  product(item: { productId: IOrderProductRef | string }): IOrderProductRef | null {
    return typeof item.productId === 'string' ? null : item.productId;
  }

  itemsTotal(order: IAdminOrder): number {
    return order.totalPrice - order.shippingCost;
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

  isDanger(status: string): boolean {
    return status === 'cancelled by admin' || status === 'rejected';
  }
}