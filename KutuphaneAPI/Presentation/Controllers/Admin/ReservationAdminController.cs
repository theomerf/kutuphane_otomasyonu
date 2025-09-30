using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Presentation.Hubs;
using Services.Contracts;
using System.Text.Json;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/reservation")]
    public class ReservationAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;
        private readonly IHubContext<ReservationHub> _hubContext;

        public ReservationAdminController(IServiceManager manager, IHubContext<ReservationHub> hubContext)
        {
            _manager = manager;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllReservations([FromQuery] ReservationRequestParameters p)
        {
            var pagedResult = await _manager.ReservationService.GetAllReservationsAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData));

            return Ok(pagedResult.reservations);
        }

        [HttpGet("active-count")]
        public async Task<IActionResult> GetActiveReservationsCount()
        {
            var count = await _manager.ReservationService.GetActiveReservationsCountAsync();

            return Ok(count);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReservationById([FromRoute] int id)
        {
            var reservation = await _manager.ReservationService.GetReservationByIdAsync(id, false);
            return Ok(reservation);
        }

        [HttpPatch("cancel-reservation/{reservationId}")]
        public async Task<IActionResult> CancelReservation([FromRoute] int reservationId)
        {
            var reservation = await _manager.ReservationService.ChangeStatusOfReservation(reservationId, ReservationStatus.Cancelled);

            var groupName = $"date_{reservation.ReservationDate}_slot_{reservation.TimeSlotId}";
            await _hubContext.Clients.Group(groupName).SendAsync("SeatCancelled",
                reservation.SeatId, reservation.ReservationDate, reservation.TimeSlotId);

            return Ok();
        }
    }
}
