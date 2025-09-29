using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;
using System.Security.Claims;

namespace Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public NotificationController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet("account")]
        public async Task<IActionResult> GetAllNotificationsOfOneUser()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var notifications = await _manager.NotificationService.GetNotificationsByUserIdAsync(accountId!, false);

            return Ok(notifications);
        }

        [HttpGet("account/count")]
        public async Task<IActionResult> GetNotificationsCountOfOneUser()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var count = await _manager.NotificationService.GetNotificationsCountOfOneUserAsync(accountId!);

            return Ok(count);
        }

        [HttpPatch("account/mark-as-read/{id}")]
        public async Task<IActionResult> MarkNotificationAsRead([FromRoute] int id)
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _manager.NotificationService.MarkNotificationAsReadAsync(id, accountId!);

            return Ok();
        }

        [HttpPatch("account/mark-all-as-read")]
        public async Task<IActionResult> MarkAllNotificationsAsReadOfOneUser()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _manager.NotificationService.MarkAllNotificationsAsReadAsync(accountId!);

            return Ok();
        }

        [HttpDelete("account/delete/{id}")]
        public async Task<IActionResult> DeleteNotificationForUser([FromRoute] int id)
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _manager.NotificationService.DeleteNotificationForUserAsync(id, accountId!);

            return Ok();
        }

        [HttpDelete("account/delete-all")]
        public async Task<IActionResult> DeleteAllNotificationsOfOneUser()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _manager.NotificationService.DeleteAllNotificationsOfUserAsync(accountId!);

            return Ok();
        }
    }
}
