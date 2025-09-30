export default interface ReservationRequestParameters {
    date?: string;
    timeSlotId?: number;
    pageNumber?: number;
    pageSize?: number;
    orderBy?: string;
}