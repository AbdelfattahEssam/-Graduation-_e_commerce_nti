import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IAdminTestimonialsRes, ITestimonialCreateRes, ITestimonialsRes } from '../models/testimonial.model';

@Service()
export class TestimonialService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'testimonials';

    getApproved() {
        return this._http.get<ITestimonialsRes>(this._apiURL);
    }

    create(data: { rating: number; content: string }) {
        return this._http.post<ITestimonialCreateRes>(this._apiURL, data);
    }

    // ---------- Admin ----------
    getAllAdmin(page: number = 1, limit: number = 10, status: string = '') {
        let params = new HttpParams().set('page', page).set('limit', limit);
        if (status) params = params.set('status', status);
        return this._http.get<IAdminTestimonialsRes>(this._apiURL + '/admin/all', { params });
    }

    updateStatus(id: string, status: string) {
        return this._http.patch(this._apiURL + '/' + id + '/status', { status });
    }
}