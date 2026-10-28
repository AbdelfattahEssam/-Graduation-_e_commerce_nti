import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { IFaqRes, IFaqsRes } from '../models/faq.model';

@Service()
export class FaqService {

    private _http = inject(HttpClient);
    private _apiURL = enveronment.apiURL + 'faqs';

    getFaqs() {
        return this._http.get<IFaqsRes>(this._apiURL);
    }

    createFaq(data: { question: string; answer: string }) {
        return this._http.post<IFaqRes>(this._apiURL, data);
    }

    updateFaq(id: string, data: { question: string; answer: string }) {
        return this._http.patch<IFaqRes>(this._apiURL + '/' + id, data);
    }

    deleteFaq(id: string) {
        return this._http.delete<{ success: boolean; message: string }>(this._apiURL + '/' + id);
    }
}