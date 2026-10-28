import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { ICategoriesRes, ICategoryRes, ISubcategoriesRes, ISubcategoryRes } from '../models/category.model';

@Service()
export class CategoryService {
  private _http = inject(HttpClient);

  getCategories() {
    return this._http.get<ICategoriesRes>(enveronment.apiURL + 'categories');
  }

  getSubcategories(categoryId?: string) {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    return this._http.get<ISubcategoriesRes>(enveronment.apiURL + 'subcategories', { params });
  }

  // ---------- Admin ----------
  getAdminCategories() {
    return this._http.get<ICategoriesRes>(enveronment.apiURL + 'categories/admin/all');
  }

  getAdminSubcategories(categoryId?: string) {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    return this._http.get<ISubcategoriesRes>(enveronment.apiURL + 'subcategories/admin/all', {
      params,
    });
  }
  createCategory(name: string) {
    return this._http.post<ICategoryRes>(enveronment.apiURL + 'categories', { name });
  }

  updateCategory(id: string, data: { name?: string; isActive?: boolean }) {
    return this._http.patch<ICategoryRes>(enveronment.apiURL + 'categories/' + id, data);
  }

  deleteCategory(id: string) {
    return this._http.delete<{ success: boolean; message: string }>(
      enveronment.apiURL + 'categories/' + id,
    );
  }

  createSubcategory(name: string, categoryId: string) {
    return this._http.post<ISubcategoryRes>(enveronment.apiURL + 'subcategories', {
      name,
      categoryId,
    });
  }

  updateSubcategory(id: string, data: { name?: string; isActive?: boolean }) {
    return this._http.patch<ISubcategoryRes>(enveronment.apiURL + 'subcategories/' + id, data);
  }

  deleteSubcategory(id: string) {
    return this._http.delete<{ success: boolean; message: string }>(
      enveronment.apiURL + 'subcategories/' + id,
    );
  }
}
