export default interface Account {
    id?: string;
    userName?: string;
    email?: string;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    membershipDate?: Date;
    birthDate?: Date;
    lastLoginDate?: Date;
    roles?: string[];
}