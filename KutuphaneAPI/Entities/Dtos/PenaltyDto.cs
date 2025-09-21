using Entities.Models;

namespace Entities.Dtos
{
    public record PenaltyDto
    {
        public int Id { get; init; }
        public String AccountId { get; init; } = null!;
        public decimal Amount { get; init; }
        public String Reason { get; init; } = null!;
        public DateTime IssuedDate { get; init; }
        public bool IsPaid { get; init; }
    }
}
