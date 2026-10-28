import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './shared/footer/footer';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
@Component({
  imports: [RouterOutlet, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {

  private _authService = inject(AuthService);
    private _cartService = inject(CartService);

  ngOnInit(): void {
    this._authService.checkIfLogedin();
  }
}