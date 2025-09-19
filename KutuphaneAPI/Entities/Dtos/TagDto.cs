using Entities.Models;

namespace Entities.Dtos
{
    public record TagDto
    {
        public int Id { get; init; }
        public String? Name { get; init; }
        public int BookCount { get; init; }
    }
}
