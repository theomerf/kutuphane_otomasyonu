using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

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

        [HttpPost("create")]
        public async Task<IActionResult> CreateAuthor([FromBody] AuthorDtoForCreation authorDto)
        {
            await _manager.AuthorService.CreateAuthorAsync(authorDto);

            return Ok();
        }

        [HttpPut("update")]
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
