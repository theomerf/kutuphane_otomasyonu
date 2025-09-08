import type Book from "./book";

export default interface Author {
    Id: number | null;
    Name: string | null;
    Books: Book[] | null;
}