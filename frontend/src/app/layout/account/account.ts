import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AddressService } from '../../core/services/address.service';
import { ShippingService } from '../../core/services/shipping.service';
import { IAddress, IAddressData, IShippingZone, IUserProfile } from '../../core/models/user.model';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-account',
  styleUrl: './account.css',
  templateUrl: './account.html',
})
export class Account implements OnInit {

  private _userService = inject(UserService);
  private _addressService = inject(AddressService);
  private _shippingService = inject(ShippingService);
  private _cdr = inject(ChangeDetectorRef);

  user!: IUserProfile;
  addresses: IAddress[] = [];
  zones: IShippingZone[] = [];

  isLoading = true;
  errorMessage = '';

  profileMessage = '';
  profileError = '';

  showAddressForm = false;
  editingId: string | null = null;
  addressError = '';

  profileForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    mobile: new FormControl('', [Validators.pattern(/^01[0125][0-9]{8}$/)])
  });

  addressForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    governorate: new FormControl('', [Validators.required]),
    city: new FormControl(''),
    street: new FormControl('', [Validators.required]),
    details: new FormControl(''),
    isDefault: new FormControl(false)
  });

  ngOnInit(): void {
    this._userService.getMe().subscribe({
      next: (res) => {
        this.user = res.data.user;
        this.addresses = res.data.user.addresses;
        this.profileForm.patchValue({
          name: this.user.name,
          mobile: this.user.mobile ?? ''
        });
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load your account';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });

    this._shippingService.getZones().subscribe({
      next: (res) => {
        this.zones = res.data.zones;
        this._cdr.detectChanges();
      }
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileMessage = '';
    this.profileError = '';

    const { name, mobile } = this.profileForm.value;
    const data: { name?: string; mobile?: string } = { name: name ?? '' };
    if (mobile) data.mobile = mobile;

    this._userService.updateMe(data).subscribe({
      next: (res) => {
        this.user = res.data.user;
        this.profileMessage = 'Profile updated';
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.profileError = err.error?.message || 'Failed to update profile';
        this._cdr.detectChanges();
      }
    });
  }

  openAddForm() {
    this.editingId = null;
    this.addressError = '';
    this.addressForm.reset({
      title: '', governorate: '', city: '', street: '', details: '', isDefault: false
    });
    this.showAddressForm = true;
  }

  openEditForm(address: IAddress) {
    this.editingId = address._id;
    this.addressError = '';
    this.addressForm.patchValue({
      title: address.title,
      governorate: address.governorate,
      city: address.city ?? '',
      street: address.street,
      details: address.details ?? ''
    });
    this.showAddressForm = true;
  }

  closeAddressForm() {
    this.showAddressForm = false;
    this.editingId = null;
  }

  saveAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    this.addressError = '';
    const data = this.addressForm.value as IAddressData;

    const request = this.editingId
      ? this._addressService.updateAddress(this.editingId, {
          title: data.title,
          governorate: data.governorate,
          city: data.city,
          street: data.street,
          details: data.details
        })
      : this._addressService.addAddress(data);

    request.subscribe({
      next: (res) => {
        this.addresses = res.data.addresses;
        this.closeAddressForm();
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.addressError = err.error?.message || 'Failed to save address';
        this._cdr.detectChanges();
      }
    });
  }

  makeDefault(address: IAddress) {
    this._addressService.setDefault(address._id).subscribe({
      next: (res) => {
        this.addresses = res.data.addresses;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Something went wrong';
        this._cdr.detectChanges();
      }
    });
  }

  deleteAddress(address: IAddress) {
    if (!confirm('Delete this address?')) return;

    this._addressService.deleteAddress(address._id).subscribe({
      next: (res) => {
        this.addresses = res.data.addresses;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Something went wrong';
        this._cdr.detectChanges();
      }
    });
  }
}