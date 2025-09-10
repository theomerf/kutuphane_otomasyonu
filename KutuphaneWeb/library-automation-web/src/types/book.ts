import type Author from "./author";
import type BookImage from "./bookImage";
import type Category from "./category";
import type Tag from "./tag";

export default interface Book {
    id: number | null;
    isbn: string | null;
    title: string | null;
    totalCopies: number | null;
    averageRating: number | null;
    availableCopies: number | null;
    location: string | null;
    publishedDate: Date | null;
    summary: string | null;
    Images: BookImage[] | null;
    Tags: Tag[] | null;
    Authors: Author[] | null;
    Categories: Category[] | null;
}