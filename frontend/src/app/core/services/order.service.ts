import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IAdminOrdersListRes, IOrderRes, IOrdersListRes } from '../models/order.model';

@Service()
export class OrderService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'orders';

    createOrder(addressId: string) {
        return this._http.post<IOrderRes>(this._apiURL, { addressId });
    }

    getMyOrders(page: number = 1, limit: number = 5) {
        const params = new HttpParams().set('page', page).set('limit', limit);
        return this._http.get<IOrdersListRes>(this._apiURL + '/my', { params });
    }

    getMyOrder(id: string) {
        return this._http.get<IOrderRes>(this._apiURL + '/my/' + id);
    }

    cancelMyOrder(id: string) {
        return this._http.patch<IOrderRes>(this._apiURL + '/my/' + id + '/cancel', {});
    }
    getAllOrders(page: number = 1, limit: number = 10, status: string = '') {
        let params = new HttpParams().set('page', page).set('limit', limit);
        if (status) params = params.set('status', status);
        return this._http.get<IAdminOrdersListRes>(this._apiURL, { params });
    }

    updateStatus(id: string, status: string) {
        return this._http.patch<IOrderRes>(this._apiURL + '/' + id + '/status', { status });
    }
}