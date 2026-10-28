import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService } from '../../core/services/order.service';
import { IOrder, IOrderProductRef } from '../../core/models/order.model';
import { enveronment } from '../../../environments/env';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-order-details',
  styleUrl: './order-details.css',
  templateUrl: './order-details.html',
})
export class OrderDetails implements OnInit {

  private _orderService = inject(OrderService);
  private _activatedRoute = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);

  order!: IOrder;
  isLoading = true;
  isCancelling = false;
  errorMessage = '';
  staticURL = enveronment.staticURL;

  ngOnInit(): void {
    const id = this._activatedRoute.snapshot.paramMap.get('id');
    if (!id) return;

    this._orderService.getMyOrder(id).subscribe({
      next: (res) => {
        this.order = res.data.order;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load order';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  product(item: { productId: IOrderProductRef | string }): IOrderProductRef | null {
    return typeof item.productId === 'string' ? null : item.productId;
  }

  get itemsTotal(): number {
    return this.order.totalPrice - this.order.shippingCost;
  }

  cancelOrder() {
    if (!confirm('Cancel this order?')) return;

    this.isCancelling = true;
    this.errorMessage = '';

    this._orderService.cancelMyOrder(this.order._id).subscribe({
      next: (res) => {
        this.order = { ...this.order, status: res.data.order.status };
        this.isCancelling = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to cancel the order';
        this.isCancelling = false;
        this._cdr.detectChanges();
      }
    });
  }
}