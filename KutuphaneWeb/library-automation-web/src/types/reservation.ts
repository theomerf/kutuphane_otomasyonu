import type TimeSlot from "./timeSlot";

export default interface ReservationResponse {
    id?: number;
    accountId?: number;
    accountUserName?: string;
    seatId: number;
    timeSlotId: number;
    timeSlotStartTime?: string;
    timeSlotEndTime?: string;
    reservationDate: Date;
    displayReservationDate?: string;
    timeSlot?: TimeSlot;
    createdAt?: Date;
    updatedAt?: string
    status?: "Active" | "Cancelled" | "Completed" | "Expired";
    displayStatus?: string;
}