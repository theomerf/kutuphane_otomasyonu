export default interface BookRequestParameters {
    searchTerm?: string;
    orderBy?: string;
    pageNumber?: string;
    pageSize?: string;
    fiels?: string;
    author?: string;
    title?: string;
    tag?: string;
    category?: string;

    [key: string]: string | undefined;
}