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

        [HttpGet]
        public async Task<IActionResult> GetAllTags([FromQuery] AdminRequestParameters p)
        {
            var pagedResult = await _manager.TagService.GetAllTagsAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData));

            return Ok(pagedResult.tags);
        }

        [HttpGet("nopagination")]
        public async Task<IActionResult> GetAllTagsWithoutPagination()
        {
            var tags = await _manager.TagService.GetAllTagsWithoutPaginationAsync(false);
            return Ok(tags);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllTagsCount()
        {
            var count = await _manager.TagService.GetAllTagsCountAsync();

            return Ok(count);
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
