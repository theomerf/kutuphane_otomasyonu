import type Book from "./book";

export default interface Tag {
    id: number | null;
    name: string | null;
    bookCount: number | null;
    Books: Book[] | null;
}