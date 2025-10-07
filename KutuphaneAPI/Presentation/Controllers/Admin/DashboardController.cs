using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public DashboardController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public IActionResult GetAdminDashboard()
        {
            return Ok();
        }

        [HttpGet("loan-stats")]
        public async Task<IActionResult> GetDashboardLoanStats()
        {
            var loanStats = await _manager.LoanService.GetLoanStatsByCategoryAsync();

            return Ok(loanStats);
        }

        [HttpGet("reservation-stats")]
        public async Task<IActionResult> GetDashboardReservationStats()
        {
            var reservationStats = await _manager.ReservationService.GetReservationsCountOfMonthDailyAsync();

            return Ok(reservationStats);
        }
    }
}
