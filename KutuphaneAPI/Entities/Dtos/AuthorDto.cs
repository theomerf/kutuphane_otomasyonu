namespace Entities.Dtos
{
    public record AuthorDto
    {
        public int Id { get; init; }
        public String? Name { get; init; }
        public int BookCount { get; init; }
    }
}
