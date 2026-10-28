export interface ITestimonial {
    _id: string;
    userId: {
        _id: string;
        name: string;
    };
    rating: number;
    content: string;
    status: string;
    createdAt: string;
}

export interface ITestimonialsRes {
    success: boolean;
    data: {
        testimonials: ITestimonial[];
    };
}

export interface ITestimonialCreateRes {
    success: boolean;
    message: string;
}
export interface IAdminTestimonial extends Omit<ITestimonial, 'userId'> {
    userId: {
        _id: string;
        name: string;
        email: string;
    };
}

export interface IAdminTestimonialsRes {
    success: boolean;
    data: {
        testimonials: IAdminTestimonial[];
        total: number;
        page: number;
        totalPages: number;
    };
}