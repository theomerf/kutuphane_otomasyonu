using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/tags")]
    public class TagsAdminController : ControllerBase
    {
    }
}
