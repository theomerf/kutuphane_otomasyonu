import type Author from "./author";
import type BookImage from "./bookImage";
import type Category from "./category";
import type Tag from "./tag";

export default interface Book {
    Id: number | null;
    Isbn: string | null;
    Title: string | null;
    TotalCopies: number | null;
    AvailableCopies: number | null;
    Location: string | null;
    PublishedDate: Date | null;
    Summary: string | null;
    Images: BookImage[] | null;
    Tags: Tag[] | null;
    Authors: Author[] | null;
    Categories: Category[] | null;
}