namespace Entities.Models
{
    public class BookImage
    {
        public int Id { get; set; }
        public Book? Book { get; set; }
        public int BookId { get; set; }
        public String? ImageUrl { get; set; }
        public bool IsPrimary { get; set; }
        public String? Caption { get; set; }
    }
}
