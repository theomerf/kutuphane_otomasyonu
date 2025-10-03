using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Text.Json;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/authors")]
    public class AuthorsAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public AuthorsAdminController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAuthors([FromQuery] AdminRequestParameters p)
        {
            var pagedResult = await _manager.AuthorService.GetAllAuthorsAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData));

            return Ok(pagedResult.authors);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllAuthorsCount()
        {
            var count = await _manager.AuthorService.GetAllAuthorsCountAsync();

            return Ok(count);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateAuthor([FromBody] AuthorDtoForCreation authorDto)
        {
            await _manager.AuthorService.CreateAuthorAsync(authorDto);

            return Ok();
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateAuthor([FromBody] AuthorDtoForUpdate authorDto)
        {
            await _manager.AuthorService.UpdateAuthorAsync(authorDto);

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAuthor([FromRoute] int id)
        {
            await _manager.AuthorService.DeleteAuthorAsync(id);

            return Ok();
        }
    }
}
