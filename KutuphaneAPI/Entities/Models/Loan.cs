namespace Entities.Models
{
    public class Loan
    {
        public int Id { get; set; }
        public string AccountId { get; set; } = null!;
        public Account? Account { get; set; }
        public ICollection<LoanLine>? LoanLines { get; set; }
        public DateTime LoanDate { get; set; } = DateTime.UtcNow;
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public LoanStatus Status { get; set; } = LoanStatus.OnLoan;
        public int? PenaltyId { get; set; }
        public decimal? FineAmount { get; set; }
    }

    public enum LoanStatus
    {
        OnLoan,
        Returned,
        Overdue,
        Canceled
    }
}
