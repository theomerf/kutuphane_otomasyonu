using Entities.Models;

namespace Entities.Dtos
{
    public record BookDto
    {
        public int Id { get; init; }
        public String? ISBN { get; init; }
        public String? Title { get; init; }
        public int TotalCopies { get; init; }
        public int AvailableCopies { get; init; }
        public String? Location { get; init; }
        public ICollection<String>? Tags { get; init; }
        public DateTime PublishedDate { get; init; }
        public String? Summary { get; init; }
        public ICollection<Author>? Authors { get; init; }
        public ICollection<Category>? Categories { get; init; }
    }
}
