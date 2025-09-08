import type Book from "./book";

export default interface Category {
    Id: number | null;
    Name: string | null;
    ParentId: number | null;
    Books: Book[] | null;
}