using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;

namespace Presentation.Controllers
{
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

        [HttpGet("statuses")]
        public async Task<IActionResult> GetSeatStatuses()
        {
            var statuses = await _manager.SeatService.GetSeatStatusesAsync(false);
            return Ok(statuses);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSeatById([FromRoute] int id)
        {
            var seat = await _manager.SeatService.GetSeatByIdAsync(id, false);
            return Ok(seat);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateSeat([FromBody] SeatDto seatDto)
        {
            await _manager.SeatService.CreateSeatAsync(seatDto);
            return Ok();
        }

        [Authorize]
        [HttpPost("timeslot/create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateTimeSlot([FromBody] TimeSlotDto timeSlotDto)
        {
            await _manager.SeatService.CreateTimeSlotAsync(timeSlotDto);
            return Ok();
        }

        [HttpGet("timeslots")]
        public async Task<IActionResult> GetAllTimeSlots()
        {
            var timeSlots = await _manager.SeatService.GetAllTimeSlotsAsync(false);
            return Ok(timeSlots);
        }
    }
}
