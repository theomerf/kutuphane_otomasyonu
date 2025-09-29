using Entities.Models;

namespace Entities.Dtos
{
    public record NotificationDto
    {
        public int Id { get; init; }
        public String Title { get; init; } = null!;
        public String Message { get; init; } = null!;
        public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
        public bool IsRead { get; init; } = false;
        public String AccountId { get; init; } = null!;
        public NotificationType Type { get; init; } = NotificationType.Info;
    }
}
