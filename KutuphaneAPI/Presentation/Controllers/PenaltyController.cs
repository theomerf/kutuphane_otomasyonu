using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Security.Claims;

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

        [HttpGet("account")]
        public async Task<IActionResult> GetPenaltiesByAccountId()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var penalties = await _manager.PenaltyService.GetPenaltiesByAccountIdAsync(accountId!, trackChanges: false);

            return Ok(penalties);
        }
    }
}
