export default interface Loan {
    id?: number;
    accountId?: number;
    loanLines: LoanLine[];
    loanDate: string;
    dueDate: string;
    returnDate?: string;
    status?: "OnLoan" | "Returned" | "Overdue";
    fineAmount?: number;
}

export interface LoanLine {
    id?: number;
    loanId?: number;
    bookId: number;
    bookTitle?: string;
    availableCopies?: number;
    bookAuthor?: string;
    bookIsbn?: string;
    bookImageUrl?: string;
    quantity: number;
}