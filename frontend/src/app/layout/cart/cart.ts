import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ICartItem } from '../../core/models/cart.model';
import { enveronment } from '../../../environments/env';

@Component({
  imports: [RouterLink],
  selector: 'app-cart',
  styleUrl: './cart.css',
  templateUrl: './cart.html',
})
export class Cart implements OnInit {

  private _cartService = inject(CartService);
  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);

  items: ICartItem[] = [];
  subtotal = 0;
  hasIssues = false;

  isLoading = true;
  errorMessage = '';
  isLoggedIn = false;
  staticURL = enveronment.staticURL;

  ngOnInit(): void {
    this.isLoggedIn = this._authService.isLoggedIn();
    this.loadCart();
  }

  loadCart() {
    this._cartService.loadCart().subscribe({
      next: (cart) => {
        this.items = cart.items;
        this.subtotal = cart.subtotal;
        this.hasIssues = cart.hasIssues;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load cart';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  changeQuantity(item: ICartItem, step: number) {
    const newQty = item.quantity + step;
    if (newQty < 1) return;
    if (item.product && newQty > item.product.stock) return;

    this._cartService.updateQuantity(item.productId, newQty).subscribe({
      next: () => this.loadCart(),
      error: (err) => this.showError(err)
    });
  }

  remove(item: ICartItem) {
    this._cartService.removeItem(item.productId).subscribe({
      next: () => this.loadCart(),
      error: (err) => this.showError(err)
    });
  }

  acceptPrice(item: ICartItem) {
    this._cartService.acceptNewPrice(item.productId, item.currentPrice ?? 0).subscribe({
      next: () => this.loadCart(),
      error: (err) => this.showError(err)
    });
  }

  lineTotal(item: ICartItem) {
    return (item.currentPrice ?? 0) * item.quantity;
  }

  private showError(err: any) {
    this.errorMessage = err.error?.message || 'Something went wrong';
    this._cdr.detectChanges();
  }
}