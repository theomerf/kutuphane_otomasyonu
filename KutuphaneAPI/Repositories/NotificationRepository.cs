using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class NotificationRepository : RepositoryBase<Notification>, INotificationRepository
    {
        public NotificationRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Notification>> GetAllNotificationsAsync(bool trackChanges)
        {
            var notifications = await FindAll(trackChanges)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return notifications;
        }

        public async Task<int> GetNotificationsCountOfOneUserAsync(string accountId) => await FindByCondition(n => n.AccountId == accountId, false).CountAsync();

        public async Task<Notification?> GetNotificationByIdAsync(int notificationId, bool trackChanges)
        {
            var notification = await FindByCondition(n => n.Id == notificationId, trackChanges)
                .FirstOrDefaultAsync();

            return notification;
        }

        public async Task<IEnumerable<Notification>> GetNotificationsByUserIdAsync(string accountId, bool trackChanges)
        {
            var notifications = await FindByCondition(n => n.AccountId == accountId, trackChanges)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return notifications;
        }

        public void CreateNotification(Notification notification)
        {
            Create(notification);
        }

        public void DeleteNotification(Notification notification)
        {
            Remove(notification);
        }

        public void UpdateNotification(Notification notification)
        {
            Update(notification);
        }
    }
}
