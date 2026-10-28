export interface ICategory {
    _id: string;
    name: string;
    slug: string;
    isActive: boolean;
}

export interface ISubcategory {
    _id: string;
    categoryId: string;
    name: string;
    slug: string;
    isActive: boolean;
}

export interface ICategoriesRes {
    success: boolean;
    data: {
        categories: ICategory[];
    };
}

export interface ISubcategoriesRes {
    success: boolean;
    data: {
        subcategories: ISubcategory[];
    };
}
export interface ICategoryRes {
    success: boolean;
    data: {
        category: ICategory;
    };
}

export interface ISubcategoryRes {
    success: boolean;
    data: {
        subcategory: ISubcategory;
    };
}