export interface ICartItem {
    productId: string;
    quantity: number;
    isPriceChanged: boolean;
    oldPrice: number;
    currentPrice: number | null;
    unavailable: boolean;
    outOfStock: boolean;
    exceedsStock: boolean;
    product: {
        title: string;
        slug: string;
        image: string;
        stock: number;
        stockLabel: string | null;
    } | null;
}

export interface ICartRes {
    success: boolean;
    data: {
        items: ICartItem[];
        subtotal: number;
        hasIssues: boolean;
    };
}

export interface IGuestCartItem {
    productId: string;
    quantity: number;
    priceAtAdd: number;
}
export type ICartView = ICartRes['data'];

export interface IGuestValidateRes {
    success: boolean;
    data: {
        items: ICartItem[];
    };
}