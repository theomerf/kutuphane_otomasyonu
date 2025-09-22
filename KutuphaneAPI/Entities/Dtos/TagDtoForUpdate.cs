namespace Entities.Dtos
{
    public record TagDtoForUpdate : TagDtoForCreation
    {
        public int Id { get; init; }
    }
}
