using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/[controller]")]
    public class DashboardController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetAdminDashboard()
        {
            return Ok();
        }
    }
}
