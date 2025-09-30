using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;

namespace Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SeatsController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public SeatsController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSeats()
        {
            var seats = await _manager.SeatService.GetAllSeatsAsync(false);

            return Ok(seats);
        }

        [HttpGet("timeslots")]
        public async Task<IActionResult> GetAllTimeSlots()
        {
            var timeSlots = await _manager.SeatService.GetAllTimeSlotsAsync(false);
            return Ok(timeSlots);
        }
    }
}
