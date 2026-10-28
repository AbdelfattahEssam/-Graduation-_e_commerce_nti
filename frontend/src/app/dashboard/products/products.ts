import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { IAdminProduct } from '../../core/models/product.model';
import { enveronment } from '../../../environments/env';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-products',
  styleUrl: './products.css',
  templateUrl: './products.html',
})
export class Products implements OnInit {

  private _productService = inject(ProductService);
  private _cdr = inject(ChangeDetectorRef);

  products: IAdminProduct[] = [];
  search = new FormControl('');
  staticURL = enveronment.staticURL;

  isLoading = true;
  errorMessage = '';

  page = 1;
  total = 0;
  totalPages = 0;

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.isLoading = true;
    this._productService.getAdminProducts(this.page, 10, this.search.value ?? '').subscribe({
      next: (res) => {
        this.products = res.data.products;
        this.total = res.data.total;
        this.totalPages = res.data.totalPages;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load products';
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });
  }

  doSearch() {
    this.page = 1;
    this.load();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  toggle(product: IAdminProduct) {
    this._productService.toggleActive(product._id).subscribe({
      next: () => this.load(),
      error: (err) => this.showError(err)
    });
  }

  remove(product: IAdminProduct) {
    if (!confirm(`Delete "${product.title}"?`)) return;

    this._productService.deleteProduct(product._id).subscribe({
      next: () => {
        if (this.products.length === 1 && this.page > 1) this.page--;
        this.load();
      },
      error: (err) => this.showError(err)
    });
  }

  private showError(err: any) {
    this.errorMessage = err.error?.message || 'Something went wrong';
    this._cdr.detectChanges();
  }
}