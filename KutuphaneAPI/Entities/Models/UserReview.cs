namespace Entities.Models
{
    public class UserReview
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public String? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public String AccountId { get; set; } = null!;
        public Account? Account { get; set; }
        public int BookId { get; set; }
        public Book? Book { get; set; }
    }
}
