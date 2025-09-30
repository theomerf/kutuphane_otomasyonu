using Entities.Models;

namespace Repositories.Contracts
{
    public interface INotificationRepository : IRepositoryBase<Notification>
    {
        Task<IEnumerable<Notification>> GetAllNotificationsAsync(bool trackChanges);
        Task<Notification?> GetNotificationByIdAsync(int notificationId, bool trackChanges);
        Task<int> GetNotificationsCountOfOneUserAsync(string accountId);
        Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(string accountId, bool trackChanges);
        Task<IEnumerable<Notification>> GetUnreadNotificationsByUserIdAsync(string accountId, bool trackChanges);
        void CreateNotification(Notification notification);
        void DeleteNotification(Notification notification);
        void UpdateNotification(Notification notification);
    }
}
