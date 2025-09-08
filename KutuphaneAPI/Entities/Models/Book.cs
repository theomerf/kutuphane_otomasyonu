namespace Entities.Models
{
    public class Book
    {
        public int Id { get; set; }
        public String? ISBN { get; set; }
        public String? Title { get; set; }
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public String? Location { get; set; }
        public ICollection<BookImage>? Images { get; set; }
        public ICollection<Tag>? Tags { get; set; }
        public DateTime PublishedDate { get; set; }
        public String? Summary { get; set; }
        public ICollection<Author>? Authors { get; set; }
        public ICollection<Category>? Categories { get; set; }
    }
}
