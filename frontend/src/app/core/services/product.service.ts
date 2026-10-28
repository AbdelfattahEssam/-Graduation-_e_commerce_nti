import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IAdminProductRes, IAdminProductsRes, IProductRes, IProductsListRes } from '../models/product.model';

@Service()
export class ProductService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'products';

    getAllProducts(filters: { [key: string]: string | number } = {}) {
        let params = new HttpParams();
        for (const key in filters) {
            const value = filters[key];
            if (value !== '' && value !== null && value !== undefined) {
                params = params.set(key, value);
            }
        }
        return this._http.get<IProductsListRes>(this._apiURL, { params });
    }

    getProductBySlug(slug: string) {
        return this._http.get<IProductRes>(this._apiURL + '/' + slug);
    }

    getAdminProducts(page: number = 1, limit: number = 10, search: string = '') {
        let params = new HttpParams().set('page', page).set('limit', limit);
        if (search) params = params.set('search', search);
        return this._http.get<IAdminProductsRes>(this._apiURL + '/admin/all', { params });
    }

    getAdminProduct(id: string) {
        return this._http.get<IAdminProductRes>(this._apiURL + '/admin/' + id);
    }

    createProduct(data: FormData) {
        return this._http.post<IAdminProductRes>(this._apiURL, data);
    }

    updateProduct(id: string, data: FormData) {
        return this._http.patch<IAdminProductRes>(this._apiURL + '/' + id, data);
    }

    toggleActive(id: string) {
        return this._http.patch<IAdminProductRes>(this._apiURL + '/' + id + '/toggle-active', {});
    }

    deleteProduct(id: string) {
        return this._http.delete<{ success: boolean; message: string }>(this._apiURL + '/' + id);
    }
}