using Entities.Models;

namespace Entities.Dtos
{
    public record ReservationDtoForUpdate
    {
        public int Id { get; init; }
        public DateTime UpdatedAt { get; init; }
        public ReservationStatus Status { get; init; }
    }
}
