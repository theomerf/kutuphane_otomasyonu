export default interface CartResponse {
    id: number;
    accountId: number | null;
    cartLines: CartLine[];
}

export interface CartLine {
    id?: number;
    bookId: number;
    bookTitle: string;
    bookImageUrl: string;
    bookISBN: string;
    bookAuthor: string;
    cartId: number;
    quantity: number;
}