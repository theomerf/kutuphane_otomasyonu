namespace Entities.Dtos
{
    public record CartLineDto
    {
        public int Id { get; init; }
        public required int BookId { get; init; }
        public required String BookName { get; init; }
        public required String BookImageUrl { get; init; }
        public required int CartId { get; init; }
        public CartDto? Cart { get; init; }
        public int Quantity { get; init; } = 1;
    }
}
