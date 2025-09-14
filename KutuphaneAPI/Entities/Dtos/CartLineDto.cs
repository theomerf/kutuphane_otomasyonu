using Entities.Models;

namespace Entities.Dtos
{
    public record CartLineDto
    {
        public int Id { get; init; }
        public required int BookId { get; init; }
        public required String BookTitle { get; init; }
        public required String BookImageUrl { get; init; }
        public required String BookISBN { get; init; }
        public required String BookAuthor { get; init; }
        public required int CartId { get; init; }
        public int Quantity { get; set; } = 1;
    }
}
