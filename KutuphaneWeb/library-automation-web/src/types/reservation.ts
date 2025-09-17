import type TimeSlot from "./timeSlot";

export default interface ReservationResponse {
    id?: number;
    accountId?: number;
    seatId: number;
    timeSlotId: number;
    reservationDate: string;
    timeSlot?: TimeSlot;
    createdAt?: string
    updatedAt?: string
    status?: "Active" | "Cancelled" | "Completed" | "Expired";
}