import type Book from "./book";

export default interface Author {
    id: number | null;
    name: string | null;
    bookCount: number | null;
    Books: Book[] | null;
}