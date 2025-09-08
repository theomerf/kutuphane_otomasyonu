import type Book from "./book";

export default interface Tag {
    Id: number | null;
    Name: string | null;
    Books: Book[] | null;
}