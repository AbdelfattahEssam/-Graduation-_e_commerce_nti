export interface IOrderProductRef {
    _id: string;
    title: string;
    slug: string;
    image: string;
}

export interface IOrderItem {
    productId: IOrderProductRef | string;
    quantity: number;
    price: number;
}

export interface IOrder {
    _id: string;
    status: string;
    shippingCost: number;
    totalPrice: number;
    mobileSnapshot: string;
    addressSnapshot: {
        title: string;
        governorate: string;
        city?: string;
        street: string;
        details?: string;
    };
    orderItems: IOrderItem[];
    date: string;
}

export interface IOrderRes {
    success: boolean;
    data: {
        order: IOrder;
    };
}

export interface IOrdersListRes {
    success: boolean;
    data: {
        orders: IOrder[];
        total: number;
        page: number;
        totalPages: number;
    };
}
export interface IAdminOrder extends IOrder {
    userId: {
        _id: string;
        name: string;
        email: string;
    };
}

export interface IAdminOrdersListRes {
    success: boolean;
    data: {
        orders: IAdminOrder[];
        total: number;
        page: number;
        totalPages: number;
    };
}