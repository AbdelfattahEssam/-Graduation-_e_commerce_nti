export interface ILoginData {
    email: string;
    password: string;
}

export interface ISignupData {
    name: string;
    email: string;
    password: string;
}

export interface IAuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface ILoginRes {
    success: boolean;
    data: {
        token: string;
        user: IAuthUser;
    };
}

export interface IToken {
    id: string;
    name: string;
    role: string;
    exp: number;
}