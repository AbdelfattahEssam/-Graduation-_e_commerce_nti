import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BehaviorSubject, map, Observable, of, tap, throwError } from 'rxjs';
import { enveronment } from '../../../environments/env';
import { ICartRes, ICartView, IGuestCartItem, IGuestValidateRes } from '../models/cart.model';
import { IProductDetails } from '../models/product.model';
import { AuthService } from './auth.service';

@Service()
export class CartService {

    private _http = inject(HttpClient);
    private _authService = inject(AuthService);
    private _apiURL = enveronment.apiURL + 'cart';
    private _guestKey = 'guestCart';

    private cartCount = new BehaviorSubject<number>(0);

    constructor() {
        this._authService.getUserData().subscribe((user) => {
            if (user) {
                this.syncAfterLogin();
            } else {
                this.cartCount.next(this.countOf(this.getGuestItems()));
            }
        });
    }

    getCartCount() {
        return this.cartCount.asObservable();
    }

    getGuestItems(): IGuestCartItem[] {
        try {
            return JSON.parse(localStorage.getItem(this._guestKey) || '[]');
        } catch {
            return [];
        }
    }

    private saveGuestItems(items: IGuestCartItem[]) {
        localStorage.setItem(this._guestKey, JSON.stringify(items));
        this.cartCount.next(this.countOf(items));
    }

    private clearGuestItems() {
        localStorage.removeItem(this._guestKey);
    }

    private countOf(items: { quantity: number }[]) {
        return items.reduce((sum, i) => sum + i.quantity, 0);
    }

    private setCountFromRes(res: ICartRes) {
        this.cartCount.next(this.countOf(res.data.items));
    }

    private syncAfterLogin() {
        const guestItems = this.getGuestItems();

        if (guestItems.length > 0) {
            this._http.post<ICartRes>(this._apiURL + '/merge', { items: guestItems }).subscribe({
                next: (res) => {
                    this.clearGuestItems();
                    this.setCountFromRes(res);
                }
            });
        } else {
            this.getCart().subscribe();
        }
    }

    addToCart(product: IProductDetails, quantity: number = 1): Observable<void> {
        if (this._authService.isLoggedIn()) {
            return this._http
                .post<ICartRes>(this._apiURL + '/items', { productId: product._id, quantity })
                .pipe(
                    tap((res) => this.setCountFromRes(res)),
                    map(() => undefined)
                );
        }

        const items = this.getGuestItems();
        const existing = items.find((i) => i.productId === product._id);
        const newQty = (existing ? existing.quantity : 0) + quantity;

        if (newQty > product.stock) {
            return throwError(() => ({ error: { message: `Only ${product.stock} left in stock` } }));
        }

        if (existing) {
            existing.quantity = newQty;
        } else {
            items.push({ productId: product._id, quantity, priceAtAdd: product.price });
        }

        this.saveGuestItems(items);
        return of(undefined);
    }

    getCart() {
        return this._http.get<ICartRes>(this._apiURL).pipe(
            tap((res) => this.setCountFromRes(res))
        );
    }

    loadCart(): Observable<ICartView> {
        if (this._authService.isLoggedIn()) {
            return this.getCart().pipe(map((res) => res.data));
        }

        const guestItems = this.getGuestItems();
        if (guestItems.length === 0) {
            return of({ items: [], subtotal: 0, hasIssues: false });
        }

        return this._http.post<IGuestValidateRes>(this._apiURL + '/validate', { items: guestItems }).pipe(
            map((res) => {
                const items = res.data.items;
                const subtotal = items
                    .filter((i) => !i.unavailable && !i.outOfStock)
                    .reduce((sum, i) => sum + (i.currentPrice ?? 0) * i.quantity, 0);
                const hasIssues = items.some(
                    (i) => i.unavailable || i.isPriceChanged || i.outOfStock || i.exceedsStock
                );
                return { items, subtotal, hasIssues };
            })
        );
    }

    updateQuantity(productId: string, quantity: number): Observable<unknown> {
        if (this._authService.isLoggedIn()) {
            return this._http.patch<ICartRes>(this._apiURL + '/items/' + productId, { quantity });
        }

        const items = this.getGuestItems();
        const item = items.find((i) => i.productId === productId);
        if (item) item.quantity = quantity;
        this.saveGuestItems(items);
        return of(null);
    }

    removeItem(productId: string): Observable<unknown> {
        if (this._authService.isLoggedIn()) {
            return this._http.delete<ICartRes>(this._apiURL + '/items/' + productId);
        }

        this.saveGuestItems(this.getGuestItems().filter((i) => i.productId !== productId));
        return of(null);
    }

    acceptNewPrice(productId: string, currentPrice: number): Observable<unknown> {
        if (this._authService.isLoggedIn()) {
            return this._http.patch<ICartRes>(this._apiURL + '/items/' + productId + '/accept-price', {});
        }

        const items = this.getGuestItems();
        const item = items.find((i) => i.productId === productId);
        if (item) item.priceAtAdd = currentPrice;
        this.saveGuestItems(items);
        return of(null);
    }
}