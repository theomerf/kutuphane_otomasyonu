using Entities.Models;

namespace Entities.Dtos
{
    public record ReservationDto
    {
        public int Id { get; init; }
        public required String AccountId { get; init; }
        public required int SeatId { get; init; }
        public required int TimeSlotId { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime UpdatedAt { get; init; }
        public ReservationStatus Status { get; init; }
    }
}
