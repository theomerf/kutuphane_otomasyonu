using Entities.Models;

namespace Entities.Dtos
{
    public record CartLineDto
    {
        public int Id { get; init; }
        public int BookId { get; init; }
        public String? BookTitle { get; init; }
        public String? BookImageUrl { get; init; }
        public String? BookISBN { get; init; }
        public String? BookAuthor { get; init; }
        public int CartId { get; init; }
        public int Quantity { get; set; } = 1;
    }
}
