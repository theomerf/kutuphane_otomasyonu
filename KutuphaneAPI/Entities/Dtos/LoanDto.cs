using Entities.Models;

namespace Entities.Dtos
{
    public record LoanDto
    {
        public int Id { get; init; }
        public String? AccountId { get; set; }
        public String? AccountFirstName { get; init; }
        public String? AccountUserName { get; init; }
        public String? AccountLastName { get; init; }
        public ICollection<LoanLineDto>? LoanLines { get; init; }
        public DateTime LoanDate { get; init; }
        public DateTime DueDate { get; init; }
        public DateTime? ReturnDate { get; init; }
        public LoanStatus Status { get; init; }
        public decimal? FineAmount { get; init; }
    }
}
