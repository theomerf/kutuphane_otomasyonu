using Entities.Models;

namespace Entities.Dtos
{
    public record PenaltyDto
    {
        public int Id { get; init; }
        public String? AccountId { get; set; }
        public String? AccountFirstName { get; init; }
        public String? AccountUserName { get; init; }
        public String? AccountLastName { get; init; }
        public int LoanId { get; init; }
        public decimal Amount { get; init; }
        public String Reason { get; init; } = null!;
        public DateTime IssuedDate { get; init; }
        public bool IsPaid { get; init; }
    }
}
