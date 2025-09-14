namespace Entities.Models
{
    public class Book
    {
        public int Id { get; set; }
        public required String ISBN { get; set; }
        public required String Title { get; set; }
        public int TotalCopies { get; set; }
        public int AvailableCopies { get; set; }
        public required String Location { get; set; }
        public DateTime PublishedDate { get; set; }
        public String? Summary { get; set; }
        public double AverageRating { get; set; } = 0;
        public ICollection<BookImage>? Images { get; set; }
        public ICollection<Tag>? Tags { get; set; }
        public ICollection<Author>? Authors { get; set; }
        public ICollection<Category>? Categories { get; set; }
        public ICollection<Review>? Reviews { get; set; }
        public ICollection<CartLine>? CartLines { get; set; }
    }
}
