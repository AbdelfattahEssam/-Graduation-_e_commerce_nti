import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IMeRes } from '../models/user.model';

@Service()
export class UserService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'auth/me';

    getMe() {
        return this._http.get<IMeRes>(this._apiURL);
    }

    updateMe(data: { name?: string; mobile?: string }) {
        return this._http.patch<IMeRes>(this._apiURL, data);
    }
}