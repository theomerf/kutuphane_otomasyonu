export default interface BookImage {
    Id: number | null;
    BookId: number | null;
    ImageUrl: string | null;
    IsPrimary: boolean | null;
    Caption: string | null;
}