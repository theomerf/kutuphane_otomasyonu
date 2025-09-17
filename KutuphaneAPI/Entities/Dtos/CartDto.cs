using Entities.Models;

namespace Entities.Dtos
{
    public record CartDto
    {
        public int Id { get; init; }
        public String? AccountId { get; init; }
        public List<CartLineDto>? CartLines { get; init; }
    }
}
