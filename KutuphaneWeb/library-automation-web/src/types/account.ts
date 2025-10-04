export default interface Account {
    id?: string;
    userName?: string;
    email?: string;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    membershipDate?: Date;
    displayMembershipDate?: string;
    birthDate?: Date;
    displayBirthDate?: string;
    lastLoginDate?: Date;
    displayLastLoginDate?: string;
    roles?: string[];
}