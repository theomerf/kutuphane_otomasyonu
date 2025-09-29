namespace Entities.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public String Title { get; set; } = null!;
        public String Message { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsRead { get; set; } = false;
        public String AccountId { get; set; } = null!;
        public Account? Account { get; set; }
        public NotificationType Type { get; set; } = NotificationType.Info;
    }

    public enum NotificationType
    {
        Info,
        Warning,
        Alert
    }
}
