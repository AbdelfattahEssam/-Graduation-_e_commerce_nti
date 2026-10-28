import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IShippingZonesRes, IShippingZoneRes } from '../models/user.model';

@Service()
export class ShippingService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'shipping-zones';

    getZones() {
        return this._http.get<IShippingZonesRes>(this._apiURL);
    }

    updateZone(id: string, data: { cost?: number; isAvailable?: boolean }) {
        return this._http.patch<IShippingZoneRes>(this._apiURL + '/' + id, data);
    }
}