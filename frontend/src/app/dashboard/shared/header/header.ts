import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {

  private _authService = inject(AuthService);
  private _router = inject(Router);

  logout() {
    this._authService.logOut();
    this._router.navigate(['/login']);
  }
}