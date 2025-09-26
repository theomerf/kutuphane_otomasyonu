import type Author from "./author";
import type BookImage from "./bookImage";
import type Category from "./category";
import type Tag from "./tag";
import type UserReview from "./userReview";

export default interface Book {
    id: number | null;
    isbn: string | null;
    title: string | null;
    totalCopies: number | null;
    availableCopies: number | null;
    location: string | null;
    publishedDate: Date | null;
    summary: string | null;
    averageRating: number | null;
    images: BookImage[] | null;
    tags: Tag[] | null;
    authors: Author[] | null;
    categories: Category[] | null;
    reviews?: UserReview[] | null;
}