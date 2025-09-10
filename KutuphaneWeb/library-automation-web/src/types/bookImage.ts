export default interface BookImage {
    id: number | null;
    bookId: number | null;
    imageUrl: string | null;
    isPrimary: boolean | null;
    caption: string | null;
}