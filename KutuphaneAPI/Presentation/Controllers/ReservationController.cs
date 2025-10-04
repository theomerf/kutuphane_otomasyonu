using Azure.Core;
using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using Presentation.ActionFilters;
using Presentation.Hubs;
using Services.Contracts;
using System.Security.Claims;

namespace Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationController : ControllerBase
    {
        private readonly IServiceManager _manager;
        private readonly IHubContext<ReservationHub> _hubContext;
        private readonly IMemoryCache _cache;

        public ReservationController(IServiceManager manager, IHubContext<ReservationHub> hubContext, IMemoryCache cache)
        {
            _manager = manager;
            _hubContext = hubContext;
            _cache = cache;
        }

        [HttpGet("statuses")]
        public async Task<IActionResult> GetAllReservationsStatuses([FromQuery] ReservationRequestParameters p)
        {
            var reservationsStatus = await _manager.ReservationService.GetAllReservationsForStatusesAsync(p, false);

            return Ok(reservationsStatus);
        }

        [HttpGet("account")]
        public async Task<IActionResult> GetReservationsOfAccount()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var reservations = await _manager.ReservationService.GetReservationsOfOneUserAsync(accountId!, false);

            return Ok(reservations);
        }

        [HttpGet("account/count")]
        public async Task<IActionResult> GetReservationsCountOfAccount()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var count = await _manager.ReservationService.GetReservationsCountOfOneUserAsync(accountId!);

            return Ok(count);
        }

        [HttpPost("reserve-seat")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationDtoForCreation reservationDto)
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            reservationDto.AccountId = accountId!;

            var groupName = $"date_{reservationDto.ReservationDate}_slot_{reservationDto.TimeSlotId}";
            var seatKey = $"{reservationDto.SeatId}_{reservationDto.ReservationDate}_{reservationDto.TimeSlotId}";
            var connectionId = HttpContext.Request.Headers["X-SignalR-ConnectionId"].FirstOrDefault();

            var currentHolder = _cache.Get<string>($"holder_{seatKey}");

            if (currentHolder != connectionId)
            {
                return BadRequest("Bu koltuk başka bir kullanıcı tarafından seçilmiş.");
            }

            await _manager.ReservationService.CreateReservationAsync(reservationDto);
            _cache.Remove($"holder_{seatKey}");
            await _hubContext.Clients.Group(groupName).SendAsync("SeatReserved", reservationDto.SeatId, reservationDto.ReservationDate, reservationDto.TimeSlotId);

            return Ok();
        }

        [HttpPatch("account/cancel-reservation/{reservationId}")]
        public async Task<IActionResult> CancelReservationForAccount([FromRoute] int reservationId)
        {
            var reservation = await _manager.ReservationService.ChangeStatusOfReservation(reservationId, ReservationStatus.Cancelled);

            var groupName = $"date_{reservation.ReservationDate}_slot_{reservation.TimeSlotId}";
            await _hubContext.Clients.Group(groupName).SendAsync("SeatCancelled",
                reservation.SeatId, reservation.ReservationDate, reservation.TimeSlotId);

            return Ok();
        }
    }
}
