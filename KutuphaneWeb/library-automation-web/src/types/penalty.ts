export default interface Penalty {
    id?: number;
    accountId?: string;
    loanId?: number;
    accountUserName?: string;
    accountFirstName?: string;
    accountLastName?: string;
    amount: number;
    reason: string;
    issuedDate: string;
    isPaid?: boolean;
}