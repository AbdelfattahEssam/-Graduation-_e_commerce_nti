import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { IProductDetails } from '../../../core/models/product.model';
import { enveronment } from '../../../../environments/env';

@Component({
  imports: [RouterLink],
  selector: 'app-product-details',
  styleUrl: './product-details.css',
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {

  private _productService = inject(ProductService);
  private _cartService = inject(CartService);
  private _activatedRoute = inject(ActivatedRoute);
  private _cdr = inject(ChangeDetectorRef);

  myProduct!: IProductDetails;
  staticURL = enveronment.staticURL;
  isLoading = true;
  errorMessage = '';

  quantity = 1;
  isAdding = false;
  cartMessage = '';
  cartError = '';

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe(data => {
      const slug = data.get('slug');

      if (slug) {
        this.isLoading = true;
        this.errorMessage = '';
        this.quantity = 1;

        this._productService.getProductBySlug(slug).subscribe({
          next: (res) => {
            this.myProduct = res.data.product;
            this.isLoading = false;
            this._cdr.detectChanges();
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Failed to load product';
            this.isLoading = false;
            this._cdr.detectChanges();
          }
        });
      }
    });
  }

  changeQuantity(step: number) {
    const next = this.quantity + step;
    if (next >= 1 && next <= this.myProduct.stock) {
      this.quantity = next;
    }
  }

  addToCart() {
    this.isAdding = true;
    this.cartMessage = '';
    this.cartError = '';

    this._cartService.addToCart(this.myProduct, this.quantity).subscribe({
      next: () => {
        this.cartMessage = 'Added to cart';
        this.isAdding = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.cartError = err.error?.message || 'Failed to add to cart';
        this.isAdding = false;
        this._cdr.detectChanges();
      }
    });
  }
}