import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IAddressData, IAddressesRes } from '../models/user.model';

@Service()
export class AddressService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'addresses';

    addAddress(data: IAddressData) {
        return this._http.post<IAddressesRes>(this._apiURL, data);
    }

    updateAddress(id: string, data: Partial<IAddressData>) {
        return this._http.patch<IAddressesRes>(this._apiURL + '/' + id, data);
    }

    deleteAddress(id: string) {
        return this._http.delete<IAddressesRes>(this._apiURL + '/' + id);
    }

    setDefault(id: string) {
        return this._http.patch<IAddressesRes>(this._apiURL + '/' + id + '/default', {});
    }
}