namespace Entities.Dtos
{
    public record AuthorDto
    {
        public int Id { get; init; }
        public String Name { get; init; } = null!;
        public int BookCount { get; init; }
    }
}
