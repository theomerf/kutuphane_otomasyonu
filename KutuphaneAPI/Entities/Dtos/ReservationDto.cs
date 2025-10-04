using Entities.Models;

namespace Entities.Dtos
{
    public record ReservationDto
    {
        public int Id { get; init; }
        public String AccountId { get; init; } = null!;
        public String AccountUserName { get; init; } = null!;
        public int SeatId { get; init; }
        public int TimeSlotId { get; init; }
        public DateOnly ReservationDate { get; init; }
        public TimeOnly TimeSlotStartTime { get; init; }
        public TimeOnly TimeSlotEndTime { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
        public ReservationStatus Status { get; init; }
    }
}
