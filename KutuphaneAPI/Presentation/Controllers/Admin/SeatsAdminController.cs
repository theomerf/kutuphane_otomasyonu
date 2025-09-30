using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/seats")]
    public class SeatsAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public SeatsAdminController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet("statuses")]
        public async Task<IActionResult> GetSeatStatuses()
        {
            var statuses = await _manager.SeatService.GetSeatStatusesAsync(false);

            return Ok(statuses);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllSeatsCount()
        {
            var count = await _manager.SeatService.GetAllSeatsCountAsync();

            return Ok(count);
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

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateSeat([FromBody] SeatDto seatDto)
        {
            await _manager.SeatService.UpdateSeatAsync(seatDto);

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteSeat([FromRoute] int id)
        {
            await _manager.SeatService.DeleteSeatAsync(id);

            return Ok();
        }

        [HttpGet("timeslots/{id}")]
        public async Task<IActionResult> GetTimeSlotById([FromRoute] int id)
        {
            var timeSlot = await _manager.SeatService.GetTimeSlotByIdAsync(id, false);

            return Ok(timeSlot);
        }

        [HttpGet("timeslots/count")]
        public async Task<IActionResult> GetAllTimeSlotsCount()
        {
            var count = await _manager.SeatService.GetAllTimeSlotsCountAsync();

            return Ok(count);
        }

        [HttpPost("timeslots/create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateTimeSlot([FromBody] TimeSlotDto timeSlotDto)
        {
            await _manager.SeatService.CreateTimeSlotAsync(timeSlotDto);

            return Ok();
        }

        [HttpPut("timeslots/update")]
        public async Task<IActionResult> UpdateTimeSlot([FromBody] TimeSlotDto timeSlotDto)
        {
            await _manager.SeatService.UpdateTimeSlotAsync(timeSlotDto);

            return Ok();
        }

        [HttpDelete("timeslots/delete/{id}")]
        public async Task<IActionResult> DeleteTimeSlot([FromRoute] int id)
        {
            await _manager.SeatService.DeleteTimeSlotAsync(id);

            return Ok();
        }
    }
}
