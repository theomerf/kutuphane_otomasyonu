export default interface Loan {
    id?: number;
    accountId?: number;
    accountUserName?: string;
    accountFirstName?: string;
    accountLastName?: string;
    loanLines: LoanLine[];
    loanDate: string;
    dueDate: string;
    returnDate?: string;
    status?: "OnLoan" | "Returned" | "Overdue" | "Canceled";
    displayStatus?: string;
    fineAmount?: number;
}

export interface LoanLine {
    id?: number;
    loanId?: number;
    bookId: number;
    bookTitle?: string;
    availableCopies?: number;
    bookAuthor?: string;
    bookISBN?: string;
    bookImageUrl?: string;
    quantity: number;
}