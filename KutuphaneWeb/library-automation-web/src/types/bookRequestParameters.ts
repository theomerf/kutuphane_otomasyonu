export default interface BookRequestParameters extends RequestParameters {
    fields?: string;
    authorId?: number;
    categoryId?: number;
    isPopular?: boolean;
    isAvailable?: boolean;
    tagIds?: number[];
    categoryIds?: number[];
}

export interface RequestParameters {
    searchTerm?: string;
    orderBy?: string;
    pageNumber?: number;
    pageSize?: number;
}