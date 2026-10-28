import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ShippingService } from '../../core/services/shipping.service';
import { IShippingZone } from '../../core/models/user.model';

@Component({
  imports: [],
  selector: 'app-admin-shipping',
  styleUrl: './admin-shipping.css',
  templateUrl: './admin-shipping.html',
})
export class AdminShipping implements OnInit {

  private _shippingService = inject(ShippingService);
  private _cdr = inject(ChangeDetectorRef);

  zones: IShippingZone[] = [];
  costs: { [id: string]: number } = {};

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this._shippingService.getZones().subscribe({
      next: (res) => {
        this.zones = res.data.zones;
        this.zones.forEach((z) => (this.costs[z._id] = z.cost));
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load shipping zones';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  onCostInput(zone: IShippingZone, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.costs[zone._id] = value === '' ? NaN : Number(value);
  }

  isChanged(zone: IShippingZone): boolean {
    return this.costs[zone._id] !== zone.cost;
  }

  isValid(zone: IShippingZone): boolean {
    const cost = this.costs[zone._id];
    return Number.isFinite(cost) && cost >= 0;
  }

  saveCost(zone: IShippingZone) {
    if (!this.isValid(zone)) return;
    this.update(zone, { cost: this.costs[zone._id] }, `${zone.governorate}: shipping cost updated`);
  }

  toggleAvailable(zone: IShippingZone) {
    const next = !zone.isAvailable;
    this.update(
      zone,
      { isAvailable: next },
      `${zone.governorate}: shipping ${next ? 'enabled' : 'disabled'}`
    );
  }

  private update(zone: IShippingZone, data: { cost?: number; isAvailable?: boolean }, message: string) {
    this.errorMessage = '';
    this.successMessage = '';

    this._shippingService.updateZone(zone._id, data).subscribe({
      next: (res) => {
        zone.cost = res.data.zone.cost;
        zone.isAvailable = res.data.zone.isAvailable;
        this.costs[zone._id] = zone.cost;
        this.successMessage = message;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update the zone';
        this._cdr.detectChanges();
      }
    });
  }
}