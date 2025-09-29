export default interface Notification {
    id?: number;
    title: string;
    message: string;
    accountId?: string;
    isRead?: boolean;
    createdAt?: string;
    type: "Info" | "Warning" | "Alert";
}