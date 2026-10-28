export interface IFaq {
    _id: string;
    question: string;
    answer: string;
}

export interface IFaqsRes {
    success: boolean;
    data: {
        faqs: IFaq[];
    };
}
export interface IFaqRes {
    success: boolean;
    data: {
        faq: IFaq;
    };
}