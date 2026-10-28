import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { enveronment } from '../../../environments/env';
import { ILoginData, ILoginRes, ISignupData, IToken } from '../models/auth.model';
import { BehaviorSubject, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

@Service()
export class AuthService {

    private _http = inject(HttpClient);
    private _router = inject(Router);
    private _apiURL = enveronment.apiURL + 'auth';

    private userData = new BehaviorSubject<IToken | null>(null);

    getUserData() {
        return this.userData.asObservable();
    }

    isAdmin() {
        return this.userData.value?.role === 'admin';
    }
        isLoggedIn() {
        return this.userData.value !== null;
    }

    checkIfLogedin() {
        const token = this.getToken();
        if (token) {
            const decode = this.decodeToken(token);

            if (decode?.exp) {
                const expiryDate = decode.exp * 1000;
                if (Date.now() < expiryDate) {
                    return this.userData.next(decode);
                }
            }
        }
        this.logOut();
    }

    logOut() {
        this.deleteToken();
        this.userData.next(null);
    }

    login(data: ILoginData) {
        return this._http.post<ILoginRes>(this._apiURL + '/login', data).pipe(tap((res) => {
            this.handleAuth(res);
        }));
    }

    signup(data: ISignupData) {
        return this._http.post<ILoginRes>(this._apiURL + '/register', data).pipe(tap((res) => {
            this.handleAuth(res);
        }));
    }

    private handleAuth(res: ILoginRes) {
        const token = res.data?.token;
        if (token) {
            const myUserInfo = this.decodeToken(token);
            if (myUserInfo) {
                this.saveToken(token);
                this.userData.next(myUserInfo);
                if (myUserInfo.role === 'admin') {
                    this._router.navigate(['/dashboard']);
                } else {
                    this._router.navigate(['/']);
                }
            }
        }
    }

    private tokenKey = 'token';
    private saveToken(token: string) {
        localStorage.setItem(this.tokenKey, token);
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    private deleteToken() {
        localStorage.removeItem(this.tokenKey);
    }

    decodeToken(token: string): IToken | null {
        try {
            return jwtDecode<IToken>(token);
        }
        catch (err) {
            return null;
        }
    }
}