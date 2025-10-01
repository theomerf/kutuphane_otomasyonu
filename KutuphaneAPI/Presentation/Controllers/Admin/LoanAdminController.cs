using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;
using System.Text.Json;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/loan")]
    public class LoanAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public LoanAdminController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLoans([FromQuery] AdminRequestParameters p)
        {
            var pagedResult = await _manager.LoanService.GetAllLoansAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData));

            return Ok(pagedResult.loans);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllLoansCount()
        {
            var count = await _manager.LoanService.GetAllLoansCountAsync();

            return Ok(count);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneLoanById(int id)
        {
            var loan = await _manager.LoanService.GetOneLoanByIdAsync(id, trackChanges: false);

            return Ok(loan);
        }

        [HttpPatch("cancel/{id}")]
        public async Task<IActionResult> CancelLoan([FromRoute] int id)
        {
            await _manager.LoanService.ChangeStatusOfLoanAsync(id, Entities.Models.LoanStatus.Canceled);

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteLoan([FromRoute] int id)
        {
            await _manager.LoanService.DeleteLoanAsync(id);

            return Ok();
        }

        [HttpPatch("return/{id}")]
        public async Task<IActionResult> ReturnLoan([FromRoute] int id)
        {
            await _manager.LoanService.ChangeStatusOfLoanAsync(id, Entities.Models.LoanStatus.Returned);

            return Ok();
        }
    }
}
