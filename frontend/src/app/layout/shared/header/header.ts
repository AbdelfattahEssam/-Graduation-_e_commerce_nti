import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header implements OnInit {

  private _authService = inject(AuthService);
  private _cartService = inject(CartService);
  private _cdr = inject(ChangeDetectorRef);

  userName = '';
  cartCount = 0;

  ngOnInit(): void {
    this._authService.getUserData().subscribe({
      next: (data) => {
        if (data) {
          this.userName = data.name;
        } else {
          this.userName = '';
        }
      }
    });

    this._cartService.getCartCount().subscribe({
      next: (count) => {
        this.cartCount = count;
        this._cdr.detectChanges();
      }
    });
  }

  logout() {
    this._authService.logOut();
  }
}