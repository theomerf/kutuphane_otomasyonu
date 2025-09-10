import type Book from "./book";

export default interface Category {
    id: number | null;
    name: string | null;
    parentId: number | null;
    bookCount: number | null;
    Books: Book[] | null;
}