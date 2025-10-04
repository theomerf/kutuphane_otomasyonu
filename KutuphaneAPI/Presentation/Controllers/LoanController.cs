using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Security.Claims;

namespace Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LoanController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public LoanController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet("account")]
        public async Task<IActionResult> GetLoansOfAccount()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var loans = await _manager.LoanService.GetLoansByAccountIdAsync(accountId!, trackChanges: false);

            return Ok(loans);
        }

        [HttpGet("account/count")]
        public async Task<IActionResult> GetLoansCountOfAccount()
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var count = await _manager.LoanService.GetLoansCountByAccountIdAsync(accountId!);

            return Ok(count);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateLoan([FromBody] LoanDto loanDto)
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            loanDto.AccountId = accountId;

            await _manager.LoanService.CreateLoanAsync(loanDto);

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteLoanForUser([FromRoute] int id)
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            await _manager.LoanService.DeleteLoanForUserAsync(id, accountId!);

            return Ok();
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateLoan([FromBody] LoanDto loanDto)
        {
            await _manager.LoanService.UpdateLoanAsync(loanDto);

            return Ok();
        }
    }
}
