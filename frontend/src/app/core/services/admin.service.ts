import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IAdminCreateRes, IBlockRes, IStatsRes, IUsersRes } from '../models/admin.model';

@Service()
export class AdminService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'admin';

    getStats() {
        return this._http.get<IStatsRes>(this._apiURL + '/stats');
    }

    getUsers(page: number = 1, limit: number = 10, search: string = '') {
        let params = new HttpParams().set('page', page).set('limit', limit);
        if (search) params = params.set('search', search);
        return this._http.get<IUsersRes>(this._apiURL + '/users', { params });
    }

    setBlocked(id: string, isBlocked: boolean) {
        return this._http.patch<IBlockRes>(this._apiURL + '/users/' + id + '/block', { isBlocked });
    }

    createAdmin(data: { name: string; email: string; password: string }) {
        return this._http.post<IAdminCreateRes>(this._apiURL + '/admins', data);
    }
}