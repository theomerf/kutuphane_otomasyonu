namespace Entities.Models
{
    public class LoanLine
    {
        public int Id { get; set; }
        public int LoanId { get; set; }
        public Loan? Loan { get; set; }
        public int BookId { get; set; }
        public Book? Book { get; set; }
        public int Quantity { get; set; }
    }
}
