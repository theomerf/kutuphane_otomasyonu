namespace Entities.Dtos
{
    public record CategoryDtoForUpdate : CategoryDtoForCreation
    {
        public int Id { get; init; }
    }
}
