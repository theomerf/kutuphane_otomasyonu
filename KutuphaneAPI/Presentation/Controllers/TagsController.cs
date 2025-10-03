using Entities.RequestFeatures;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;
using System.Linq.Dynamic.Core;
using System.Text.Json;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagsController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public TagsController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet("nopagination")]
        public async Task<IActionResult> GetAllTagsWithoutPagination()
        {
            var tags = await _manager.TagService.GetAllTagsWithoutPaginationAsync(false);
            return Ok(tags);
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetMostPopularTags()
        {
            var tags = await _manager.TagService.GetMostPopularTagsAsync(false);

            return Ok(tags);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneTag([FromRoute] int id)
        {
            var tag = await _manager.TagService.GetOneTagAsync(id, false);

            return Ok(tag);
        }
    }
}
