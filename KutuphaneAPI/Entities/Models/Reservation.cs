namespace Entities.Models
{
    public class Reservation
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateOnly ReservationDate { get; set; }
        public ReservationStatus Status { get; set; } = ReservationStatus.Active;
        public String? AccountId { get; set; }
        public Account? Account { get; set; }
        public int SeatId { get; set; }
        public Seat? Seat { get; set; }
        public int TimeSlotId { get; set; }
        public TimeSlot? TimeSlot { get; set; }
    }

    public enum ReservationStatus
    {
        Active,
        Expired,
        Completed,
        Temp,
        Cancelled
    }
}
