using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class NotificationManager : INotificationService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public NotificationManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }

        public async Task<IEnumerable<NotificationDto>> GetAllNotificationsAsync(bool trackChanges)
        {
            var notifications = await _manager.Notification.GetAllNotificationsAsync(trackChanges);
            var notificationsDto = _mapper.Map<IEnumerable<NotificationDto>>(notifications);

            return notificationsDto;
        }

        public async Task<int> GetNotificationsCountOfOneUserAsync(string accountId) => await _manager.Notification.GetNotificationsCountOfOneUserAsync(accountId);

        public async Task<NotificationDto> GetNotificationByIdAsync(int notificationId, bool trackChanges)
        {
            var notification = await GetNotificationByIdForServiceAsync(notificationId, trackChanges);
            var notificationDto = _mapper.Map<NotificationDto>(notification);

            return notificationDto;
        }

        public async Task<Notification> GetNotificationByIdForServiceAsync(int notificationId, bool trackChanges)
        {
            var notification = await _manager.Notification.GetNotificationByIdAsync(notificationId, trackChanges);
            if (notification == null)
            {
                throw new NotificationNotFoundException(notificationId);
            }

            return notification;
        }

        public async Task<IEnumerable<NotificationDto>> GetNotificationsByUserIdAsync(string accountId, bool trackChanges)
        {
            var notifications = await _manager.Notification.GetNotificationsByUserIdAsync(accountId, trackChanges);
            var notificationsDto = _mapper.Map<IEnumerable<NotificationDto>>(notifications);

            return notificationsDto;
        }

        public async Task MarkAllNotificationsAsReadAsync(string accountId)
        {
            var notifications = await _manager.Notification.GetUnreadNotificationsByUserIdAsync(accountId, true);
            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _manager.SaveAsync();
        }

        public async Task MarkNotificationAsReadAsync(int notificationId, string accountId)
        {
            var notification = await GetNotificationByIdForServiceAsync(notificationId, true);
            if (notification.AccountId != accountId)
            {
                throw new AccessViolationException("Bu bildirimi okuma yetkiniz yok.");
            }

            notification.IsRead = true;
            await _manager.SaveAsync();
        }

        public async Task CreateNotificationAsync(NotificationDtoForCreation notificationDto)
        {
            var notification = _mapper.Map<Notification>(notificationDto);

            _manager.Notification.CreateNotification(notification);
            await _manager.SaveAsync();
        }

        public async Task DeleteNotificationAsync(int notificationId)
        {
            var notification = await GetNotificationByIdForServiceAsync(notificationId, true);

            _manager.Notification.DeleteNotification(notification);
            await _manager.SaveAsync();
        }

        public async Task DeleteNotificationForUserAsync(int notificationId, string accountId)
        {
            var notification = await GetNotificationByIdForServiceAsync(notificationId, true);

            if (notification.AccountId != accountId)
            {
                throw new AccessViolationException("Bu bildirimi silmek için yetkiye sahip değilsiniz.");
            }

            _manager.Notification.DeleteNotification(notification);
            await _manager.SaveAsync();
        }

        public async Task DeleteAllNotificationsOfUserAsync(string accountId)
        {
            var notifications = await _manager.Notification.GetNotificationsByUserIdAsync(accountId, true);

            _manager.Notification.RemoveRange(notifications);
            await _manager.SaveAsync();
        }

        public async Task UpdateNotificationAsync(NotificationDtoForUpdate notificationDto)
        {
            var notification = await GetNotificationByIdForServiceAsync(notificationDto.Id, true);

            _mapper.Map(notificationDto, notification);
            await _manager.SaveAsync();
        }
    }
}
