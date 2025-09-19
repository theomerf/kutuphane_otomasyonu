export default interface BookRequestParameters {
    searchTerm?: string;
    orderBy?: string;
    pageNumber?: number;
    pageSize?: number;
    fields?: string;
    authorId?: number;
    categoryId?: number;
    isPopular?: boolean;
    isAvailable?: boolean;
    tagIds?: number[];
    categoryIds?: number[];
}