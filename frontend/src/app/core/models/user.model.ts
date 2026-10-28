export interface IAddress {
    _id: string;
    title: string;
    governorate: string;
    city?: string;
    street: string;
    details?: string;
    isDefault: boolean;
}

export interface IAddressData {
    title: string;
    governorate: string;
    city: string;
    street: string;
    details: string;
    isDefault?: boolean;
}

export interface IUserProfile {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    role: string;
    addresses: IAddress[];
}

export interface IMeRes {
    success: boolean;
    data: {
        user: IUserProfile;
    };
}

export interface IAddressesRes {
    success: boolean;
    data: {
        addresses: IAddress[];
    };
}

export interface IShippingZone {
    _id: string;
    governorate: string;
    cost: number;
    isAvailable: boolean;
}

export interface IShippingZonesRes {
    success: boolean;
    data: {
        zones: IShippingZone[];
    };
}
export interface IShippingZoneRes {
    success: boolean;
    data: {
        zone: IShippingZone;
    };
}