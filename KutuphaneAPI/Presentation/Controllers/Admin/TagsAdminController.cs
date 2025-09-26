using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/tags")]
    public class TagsAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public TagsAdminController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateTag([FromBody] TagDtoForCreation tagDto)
        {
            await _manager.TagService.CreateTagAsync(tagDto);

            return Ok();
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateTag([FromBody] TagDtoForUpdate tagDto)
        {
            await _manager.TagService.UpdateTagAsync(tagDto);

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteTag([FromRoute] int id)
        {
            await _manager.TagService.DeleteTagAsync(id);

            return Ok();
        }
    }
}
