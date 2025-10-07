using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Security.Claims;
using System.Text.Json;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/penalty")]
    public class PenaltyAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public PenaltyAdminController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPenalties([FromQuery] AdminRequestParameters p)
        {
            var pagedResult = await _manager.PenaltyService.GetAllPenaltiesAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData));

            return Ok(pagedResult.penalties);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllPenaltiesCount()
        {
            var count = await _manager.PenaltyService.GetAllPenaltiesCountAsync();

            return Ok(count);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOnePenaltyById(int id)
        {
            var penalty = await _manager.PenaltyService.GetOnePenaltyByIdAsync(id, trackChanges: false);

            return Ok(penalty);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreatePenalty([FromBody] PenaltyDto penaltyDto)
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            penaltyDto.AccountId = accountId!;
            await _manager.PenaltyService.CreatePenaltyAsync(penaltyDto);

            return Ok();
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

        [HttpPatch("pay/{id}")]
        public async Task<IActionResult> PenaltyPaid([FromRoute] int id)
        {
            await _manager.PenaltyService.PenaltyPaidAsync(id);

            return Ok();
        }
    }
}
