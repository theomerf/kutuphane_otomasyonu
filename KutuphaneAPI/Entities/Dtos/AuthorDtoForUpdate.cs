namespace Entities.Dtos
{
    public record AuthorDtoForUpdate : AuthorDtoForCreation
    {
        public int Id { get; init; }
    }
}
