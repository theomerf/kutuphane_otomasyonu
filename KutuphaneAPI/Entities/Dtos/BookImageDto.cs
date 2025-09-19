namespace Entities.Dtos
{
    public record BookImageDto
    {
        public int Id { get; init; }
        public int BookId { get; init; }
        public String? ImageUrl { get; init; }
        public bool IsPrimary { get; init; }
        public String? Caption { get; init; }
    }
}
