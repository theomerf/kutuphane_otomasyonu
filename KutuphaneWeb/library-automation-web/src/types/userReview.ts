export default interface UserReview {
    id: number;
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt?: string;
    accountId: string;
    bookId: number;
    accountUserName: string;
    accountAvatarUrl: string;
}