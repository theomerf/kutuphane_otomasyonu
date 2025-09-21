using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;

namespace Presentation.Controllers
{
    [Authorize]
    [ServiceFilter(typeof(LogFilterAttribute))]
    [ApiController]
    [Route("api/[controller]")]
    public class PenaltyController : ControllerBase
    {
        private readonly IServiceManager _manager;
        public PenaltyController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPenalties()
        {
            var penalties = await _manager.PenaltyService.GetAllPenaltiesAsync(trackChanges: false);

            return Ok(penalties);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOnePenaltyById(int id)
        {
            var penalty = await _manager.PenaltyService.GetOnePenaltyByIdAsync(id, trackChanges: false);

            return Ok(penalty);
        }

        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetPenaltiesByAccountId(string accountId)
        {
            var penalties = await _manager.PenaltyService.GetPenaltiesByAccountIdAsync(accountId, trackChanges: false);

            return Ok(penalties);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreatePenalty([FromBody] PenaltyDto penaltyDto)
        {
            await _manager.PenaltyService.CreatePenaltyAsync(penaltyDto);

            return CreatedAtAction(nameof(GetOnePenaltyById), new { id = penaltyDto.Id }, penaltyDto);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeletePenalty([FromRoute] int id)
        {
            await _manager.PenaltyService.DeletePenaltyAsync(id);

            return Ok();
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdatePenalty([FromBody] PenaltyDto penaltyDto)
        {
            await _manager.PenaltyService.UpdatePenaltyAsync(penaltyDto);

            return Ok();
        }
    }
}
