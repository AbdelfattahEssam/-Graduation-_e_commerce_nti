export interface IProduct {
    _id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    stock: number;
    slug: string;
    categoryId: string;
    subcategoryId: string;
    isActive: boolean;
    stockLabel: string | null;
    inStock: boolean;
}

export interface IProductsListRes {
    success: boolean;
    data: {
        products: IProduct[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface IProductRes {
    success: boolean;
    data: {
        product: IProductDetails;
    };
}
export interface ICategoryRef {
    _id: string;
    name: string;
    slug: string;
}
export interface IProductDetails extends Omit<IProduct, 'categoryId' | 'subcategoryId'> {
    categoryId: ICategoryRef;
    subcategoryId: ICategoryRef;
}
export interface IAdminProduct extends Omit<IProduct, 'categoryId' | 'subcategoryId'> {
    categoryId: { _id: string; name: string };
    subcategoryId: { _id: string; name: string };
}

export interface IAdminProductsRes {
    success: boolean;
    data: {
        products: IAdminProduct[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface IAdminProductRes {
    success: boolean;
    data: {
        product: IProduct;
    };
}