export default interface CartResponse {
    id: number;
    accountId: number;
    cartLines: CartLine[];
}

export interface CartLine {
    id: number;
    bookId: number;
    bookName: string;
    bookImageUrl: string;
    cartId: number;
    quantity: number;
}