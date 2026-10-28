import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '../../core/services/category.service';
import { ICategory, ISubcategory } from '../../core/models/category.model';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-categories',
  styleUrl: './categories.css',
  templateUrl: './categories.html',
})
export class Categories implements OnInit {

  private _categoryService = inject(CategoryService);
  private _cdr = inject(ChangeDetectorRef);

  categories: ICategory[] = [];
  subcategories: ISubcategory[] = [];
  selectedCategoryId = '';

  isLoading = true;
  errorMessage = '';

  newCategory = new FormControl('', [Validators.required]);
  newSubcategory = new FormControl('', [Validators.required]);

  editingCategoryId: string | null = null;
  editingSubId: string | null = null;
  editName = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    this.loadCategories();
  }

  get selectedCategory(): ICategory | undefined {
    return this.categories.find((c) => c._id === this.selectedCategoryId);
  }

  loadCategories() {
    this._categoryService.getAdminCategories().subscribe({
      next: (res) => {
        this.categories = res.data.categories;
        this.isLoading = false;

        const stillExists = this.categories.some((c) => c._id === this.selectedCategoryId);
        if (!stillExists) {
          this.selectedCategoryId = this.categories.length > 0 ? this.categories[0]._id : '';
        }
        this.loadSubcategories();
        this._cdr.detectChanges();
      },
      error: (err) => this.fail(err)
    });
  }

  selectCategory(id: string) {
    this.selectedCategoryId = id;
    this.editingSubId = null;
    this.loadSubcategories();
  }

  addCategory() {
    if (this.newCategory.invalid) {
      this.newCategory.markAsTouched();
      return;
    }
    this.errorMessage = '';

    this._categoryService.createCategory(this.newCategory.value ?? '').subscribe({
      next: (res) => {
        this.newCategory.reset('');
        this.selectedCategoryId = res.data.category._id;
        this.loadCategories();
      },
      error: (err) => this.fail(err)
    });
  }

  startEditCategory(c: ICategory) {
    this.editingSubId = null;
    this.editingCategoryId = c._id;
    this.editName.setValue(c.name);
  }

  saveCategory(c: ICategory) {
    if (this.editName.invalid) {
      this.editName.markAsTouched();
      return;
    }
    this.errorMessage = '';

    this._categoryService.updateCategory(c._id, { name: this.editName.value ?? '' }).subscribe({
      next: () => {
        this.editingCategoryId = null;
        this.loadCategories();
      },
      error: (err) => this.fail(err)
    });
  }

  toggleCategory(c: ICategory) {
    this._categoryService.updateCategory(c._id, { isActive: !c.isActive }).subscribe({
      next: () => this.loadCategories(),
      error: (err) => this.fail(err)
    });
  }

  deleteCategory(c: ICategory) {
    if (!confirm(`Delete "${c.name}"? Its subcategories and products will be hidden from the store.`)) return;

    this._categoryService.deleteCategory(c._id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => this.fail(err)
    });
  }

  loadSubcategories() {
    if (!this.selectedCategoryId) {
      this.subcategories = [];
      this._cdr.detectChanges();
      return;
    }

    this._categoryService.getAdminSubcategories(this.selectedCategoryId).subscribe({
      next: (res) => {
        this.subcategories = res.data.subcategories;
        this._cdr.detectChanges();
      },
      error: (err) => this.fail(err)
    });
  }

  addSubcategory() {
    if (this.newSubcategory.invalid || !this.selectedCategoryId) {
      this.newSubcategory.markAsTouched();
      return;
    }
    this.errorMessage = '';

    this._categoryService.createSubcategory(this.newSubcategory.value ?? '', this.selectedCategoryId).subscribe({
      next: () => {
        this.newSubcategory.reset('');
        this.loadSubcategories();
      },
      error: (err) => this.fail(err)
    });
  }

  startEditSub(s: ISubcategory) {
    this.editingCategoryId = null;
    this.editingSubId = s._id;
    this.editName.setValue(s.name);
  }

  saveSub(s: ISubcategory) {
    if (this.editName.invalid) {
      this.editName.markAsTouched();
      return;
    }
    this.errorMessage = '';

    this._categoryService.updateSubcategory(s._id, { name: this.editName.value ?? '' }).subscribe({
      next: () => {
        this.editingSubId = null;
        this.loadSubcategories();
      },
      error: (err) => this.fail(err)
    });
  }

  toggleSub(s: ISubcategory) {
    this._categoryService.updateSubcategory(s._id, { isActive: !s.isActive }).subscribe({
      next: () => this.loadSubcategories(),
      error: (err) => this.fail(err)
    });
  }

  deleteSub(s: ISubcategory) {
    if (!confirm(`Delete "${s.name}"? Its products will be hidden from the store.`)) return;

    this._categoryService.deleteSubcategory(s._id).subscribe({
      next: () => this.loadSubcategories(),
      error: (err) => this.fail(err)
    });
  }

  cancelEdit() {
    this.editingCategoryId = null;
    this.editingSubId = null;
  }

  private fail(err: any) {
    this.errorMessage = err.error?.message || 'Something went wrong';
    this.isLoading = false;
    this._cdr.detectChanges();
  }
}