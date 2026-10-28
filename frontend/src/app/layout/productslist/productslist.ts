import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { IProduct } from '../../core/models/product.model';
import { ICategory, ISubcategory } from '../../core/models/category.model';
import { Product } from './product/product';

@Component({
  imports: [Product, ReactiveFormsModule],
  selector: 'app-productslist',
  styleUrl: './productslist.css',
  templateUrl: './productslist.html',
})
export class Productslist implements OnInit {

  private _productService = inject(ProductService);
  private _categoryService = inject(CategoryService);
  private _cdr = inject(ChangeDetectorRef);

  products: IProduct[] = [];
  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];

  isLoading = true;
  errorMessage = '';

  page = 1;
  limit = 8;
  total = 0;
  totalPages = 0;

  filterForm = new FormGroup({
    search: new FormControl(''),
    categoryId: new FormControl(''),
    subcategoryId: new FormControl(''),
    minPrice: new FormControl(''),
    maxPrice: new FormControl(''),
    sort: new FormControl('newest')
  });

  ngOnInit(): void {
    this._categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data.categories;
        this._cdr.detectChanges();
      }
    });

    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.errorMessage = '';

    const f = this.filterForm.value;

    this._productService.getAllProducts({
      search: f.search ?? '',
      categoryId: f.categoryId ?? '',
      subcategoryId: f.subcategoryId ?? '',
      minPrice: f.minPrice ?? '',
      maxPrice: f.maxPrice ?? '',
      sort: f.sort ?? '',
      page: this.page,
      limit: this.limit
    }).subscribe({
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

  onCategoryChange() {
    this.filterForm.controls.subcategoryId.setValue('');
    this.subcategories = [];

    const categoryId = this.filterForm.value.categoryId;
    if (categoryId) {
      this._categoryService.getSubcategories(categoryId).subscribe({
        next: (res) => {
          this.subcategories = res.data.subcategories;
          this._cdr.detectChanges();
        }
      });
    }

    this.applyFilters();
  }

  applyFilters() {
    this.page = 1;
    this.loadProducts();
  }

  resetFilters() {
    this.filterForm.reset({
      search: '',
      categoryId: '',
      subcategoryId: '',
      minPrice: '',
      maxPrice: '',
      sort: 'newest'
    });
    this.subcategories = [];
    this.applyFilters();
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}