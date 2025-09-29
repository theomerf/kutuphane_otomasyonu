namespace Entities.Dtos
{
    public record NotificationDtoForUpdate : NotificationDtoForCreation
    {
        public int Id { get; set; }
        public bool IsRead { get; init; }
    }
}
