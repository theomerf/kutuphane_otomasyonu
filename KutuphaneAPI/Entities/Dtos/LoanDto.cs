using Entities.Models;

namespace Entities.Dtos
{
    public record LoanDto
    {
        public int Id { get; init; }
        public String? AccountId { get; set; }
        public ICollection<LoanLineDto>? LoanLines { get; init; }
        public DateTime LoanDate { get; init; }
        public DateTime DueDate { get; init; }
        public DateTime? ReturnDate { get; init; }
        public LoanStatus Status { get; init; }
        public decimal? FineAmount { get; init; }
    }
}
