namespace Entities.Models
{
    public class Penalty
    {
        public int Id { get; set; }
        public String AccountId { get; set; } = null!;
        public Account? Account { get; set; }
        public decimal Amount { get; set; }
        public String Reason { get; set; } = null!;
        public DateTime IssuedDate { get; set; } = DateTime.UtcNow;
        public bool IsPaid { get; set; } = false;
    }
}
