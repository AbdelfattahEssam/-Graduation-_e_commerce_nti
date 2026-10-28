export interface IStats {
    pendingOrders: number;
    newOrdersToday: number;
    outOfStockProducts: number;
    pendingTestimonials: number;
}

export interface IStatsRes {
    success: boolean;
    data: IStats;
}
export interface IAdminUser {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    isBlocked: boolean;
    createdAt: string;
}

export interface IUsersRes {
    success: boolean;
    data: {
        users: IAdminUser[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface IBlockRes {
    success: boolean;
    data: {
        user: IAdminUser;
    };
}

export interface IAdminCreateRes {
    success: boolean;
    data: {
        admin: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    };
}