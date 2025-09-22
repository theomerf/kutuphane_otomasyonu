using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

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
        public async Task<IActionResult> GetAllTags()
        {
            var tags = await _manager.TagService.GetAllTagsAsync(false);

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
