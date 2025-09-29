using Entities.Dtos;

namespace Services.Contracts
{
    public interface INotificationService
    {
        Task<IEnumerable<NotificationDto>> GetAllNotificationsAsync(bool trackChanges);
        Task<NotificationDto> GetNotificationByIdAsync(int notificationId, bool trackChanges);
        Task<int> GetNotificationsCountOfOneUserAsync(string accountId);
        Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(string accountId, bool trackChanges);
        Task MarkNotificationAsReadAsync(int notificationId, string accountId);   
        Task MarkAllNotificationsAsReadAsync(string accountId);
        Task CreateNotificationAsync(NotificationDtoForCreation notificationDto);
        Task DeleteNotificationAsync(int notificationId);
        Task DeleteNotificationForUserAsync(int notificationId, string accountId);
        Task DeleteAllNotificationsOfUserAsync(string accountId);
        Task UpdateNotificationAsync(NotificationDtoForUpdate notificationDto);
    }
}
