import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { ICategory, ISubcategory } from '../../core/models/category.model';
import { enveronment } from '../../../environments/env';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-product-form',
  styleUrl: './product-form.css',
  templateUrl: './product-form.html',
})
export class ProductForm implements OnInit {

  private _productService = inject(ProductService);
  private _categoryService = inject(CategoryService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  editingId: string | null = null;
  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];

  staticURL = enveronment.staticURL;
  currentImage = '';
  previewUrl = '';
  selectedFile: File | null = null;
  fileError = '';

  isLoading = false;
  isSaving = false;
  errorMessage = '';

  form = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    stock: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
    categoryId: new FormControl('', [Validators.required]),
    subcategoryId: new FormControl('', [Validators.required]),
    isActive: new FormControl(true)
  });

  ngOnInit(): void {
    this.editingId = this._route.snapshot.paramMap.get('id');

    this._categoryService.getAdminCategories().subscribe({
      next: (res) => {
        this.categories = res.data.categories;
        this._cdr.detectChanges();
      }
    });

    if (this.editingId) {
      this.isLoading = true;
      this._productService.getAdminProduct(this.editingId).subscribe({
        next: (res) => {
          const p = res.data.product;
          this.currentImage = p.image;
          this.form.patchValue({
            title: p.title,
            description: p.description,
            price: p.price,
            stock: p.stock,
            categoryId: p.categoryId,
            isActive: p.isActive
          });
          this.loadSubcategories(p.categoryId, p.subcategoryId);
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
  }

  loadSubcategories(categoryId: string, selected: string = '') {
    this.subcategories = [];
    this.form.controls.subcategoryId.setValue('');
    if (!categoryId) return;

    this._categoryService.getAdminSubcategories(categoryId).subscribe({
      next: (res) => {
        this.subcategories = res.data.subcategories;
        this.form.controls.subcategoryId.setValue(selected);
        this._cdr.detectChanges();
      }
    });
  }

  onCategoryChange() {
    this.loadSubcategories(this.form.value.categoryId ?? '');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fileError = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.fileError = 'Please choose an image file';
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.fileError = 'Image must be 2MB or less';
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const v = this.form.value;
    const data = new FormData();
    data.append('title', v.title ?? '');
    data.append('description', v.description ?? '');
    data.append('price', String(v.price));
    data.append('stock', String(v.stock));
    data.append('categoryId', v.categoryId ?? '');
    data.append('subcategoryId', v.subcategoryId ?? '');
    data.append('isActive', String(v.isActive));
    if (this.selectedFile) {
      data.append('image', this.selectedFile);
    }

    const request: Observable<unknown> = this.editingId
      ? this._productService.updateProduct(this.editingId, data)
      : this._productService.createProduct(data);

    request.subscribe({
      next: () => {
        this._router.navigate(['/dashboard/products']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to save the product';
        this.isSaving = false;
        this._cdr.detectChanges();
      }
    });
  }
}