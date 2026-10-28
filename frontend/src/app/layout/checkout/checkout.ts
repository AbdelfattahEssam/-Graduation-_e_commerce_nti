import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { UserService } from '../../core/services/user.service';
import { ShippingService } from '../../core/services/shipping.service';
import { OrderService } from '../../core/services/order.service';
import { ICartItem } from '../../core/models/cart.model';
import { IAddress, IShippingZone, IUserProfile } from '../../core/models/user.model';
import { IOrder } from '../../core/models/order.model';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-checkout',
  styleUrl: './checkout.css',
  templateUrl: './checkout.html',
})
export class Checkout implements OnInit {
  private _cartService = inject(CartService);
  private _userService = inject(UserService);
  private _shippingService = inject(ShippingService);
  private _orderService = inject(OrderService);
  private _cdr = inject(ChangeDetectorRef);

  items: ICartItem[] = [];
  subtotal = 0;
  hasIssues = false;

  user!: IUserProfile;
  addresses: IAddress[] = [];
  zones: IShippingZone[] = [];
  selectedAddressId = '';

  mobile = new FormControl('', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]);

  isLoading = true;
  isPlacing = false;
  errorMessage = '';
  placedOrder: IOrder | null = null;

  ngOnInit(): void {
    this._cartService.loadCart().subscribe({
      next: (cart) => {
        this.items = cart.items;
        this.subtotal = cart.subtotal;
        this.hasIssues = cart.hasIssues;
        this._cdr.detectChanges();
      },
    });

    this._shippingService.getZones().subscribe({
      next: (res) => {
        this.zones = res.data.zones;
        this._cdr.detectChanges();
      },
    });

    this._userService.getMe().subscribe({
      next: (res) => {
        this.user = res.data.user;
        this.addresses = res.data.user.addresses;
        this.mobile.setValue(res.data.user.mobile ?? '');

        const def = this.addresses.find((a) => a.isDefault) || this.addresses[0];
        this.selectedAddressId = def ? def._id : '';

        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load checkout';
        this.isLoading = false;
        this._cdr.detectChanges();
      },
    });
  }

  get selectedAddress(): IAddress | undefined {
    return this.addresses.find((a) => a._id === this.selectedAddressId);
  }

  get selectedZone(): IShippingZone | undefined {
    const address = this.selectedAddress;
    return address ? this.zones.find((z) => z.governorate === address.governorate) : undefined;
  }

  get shippingAvailable(): boolean {
    return !!this.selectedZone && this.selectedZone.isAvailable;
  }

  get shippingCost(): number {
    return this.selectedZone ? this.selectedZone.cost : 0;
  }

  get total(): number {
    return this.subtotal + (this.shippingAvailable ? this.shippingCost : 0);
  }

  get canPlaceOrder(): boolean {
    return (
      !this.isPlacing &&
      !this.hasIssues &&
      this.items.length > 0 &&
      !!this.selectedAddress &&
      this.shippingAvailable &&
      this.mobile.valid
    );
  }

  placeOrder() {
    if (!this.canPlaceOrder) {
      this.mobile.markAsTouched();
      return;
    }

    this.isPlacing = true;
    this.errorMessage = '';

    const mobileValue = this.mobile.value ?? '';
    const needsMobileUpdate = mobileValue !== (this.user.mobile ?? '');

    const saveMobile$: Observable<unknown> = needsMobileUpdate
      ? this._userService.updateMe({ mobile: mobileValue })
      : of(null);

    saveMobile$
      .pipe(switchMap(() => this._orderService.createOrder(this.selectedAddressId)))
      .subscribe({
        next: (res) => {
          this.placedOrder = res.data.order;
          this.isPlacing = false;
          this._cartService.getCart().subscribe();
          this._cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to place the order';
          this.isPlacing = false;
          this._cdr.detectChanges();
        },
      });
  }
}
