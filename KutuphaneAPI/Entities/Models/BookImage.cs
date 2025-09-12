namespace Entities.Models
{
    public class BookImage
    {
        public int Id { get; set; }
        public Book? Book { get; set; }
        public required int BookId { get; set; }
        public required String ImageUrl { get; set; }
        public bool IsPrimary { get; set; } = true;
        public String? Caption { get; set; }
    }
}
