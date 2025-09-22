using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]    
    [ApiController]
    [Route("api/admin/categories")]
    public class CategoriesAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public CategoriesAdminController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryDtoForCreation categoryDto)
        {
            await _manager.CategoryService.CreateCategoryAsync(categoryDto);

            return Ok();
        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateCategory([FromBody] CategoryDtoForUpdate categoryDto)
        {
            await _manager.CategoryService.UpdateCategoryAsync(categoryDto);

            return Ok();
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteCategory([FromRoute] int id)
        {
            await _manager.CategoryService.DeleteCategoryAsync(id);

            return Ok();
        }
    }
}
