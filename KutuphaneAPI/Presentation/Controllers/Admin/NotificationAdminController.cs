using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles= "Admin")]
    [ApiController]
    [Route("api/admin/notifications")]
    public class NotificationAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public NotificationAdminController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllNotifications()
        {
            var notifications = await _manager.NotificationService.GetAllNotificationsAsync(false);

            return Ok(notifications);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneNotificationById([FromRoute] int id)
        {
            var notification = await _manager.NotificationService.GetNotificationByIdAsync(id, false);

            return Ok(notification);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationDtoForCreation notificationDto)
        {
            await _manager.NotificationService.CreateNotificationAsync(notificationDto);

            return Ok();
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateNotification([FromBody] NotificationDtoForUpdate notificationDto)
        {
            await _manager.NotificationService.UpdateNotificationAsync(notificationDto);

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteNotification([FromRoute] int id)
        {
            await _manager.NotificationService.DeleteNotificationAsync(id);

            return Ok();
        }
    }
}
