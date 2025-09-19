import type Book from "./book";

export default interface Tag {
    id: number | null;
    name: string | null;
    books: Book[] | null;
}