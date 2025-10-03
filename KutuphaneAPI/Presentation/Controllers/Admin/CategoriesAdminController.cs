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
    [Route("api/admin/categories")]
    public class CategoriesAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public CategoriesAdminController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] AdminRequestParameters p)
        {
            var pagedResult = await _manager.CategoryService.GetAllCategoriesAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData));

            return Ok(pagedResult.categories);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllCategoriesCount()
        {
            var count = await _manager.CategoryService.GetAllCategoriesCountAsync();

            return Ok(count);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateCategory([FromBody] CategoryDtoForCreation categoryDto)
        {
            await _manager.CategoryService.CreateCategoryAsync(categoryDto);

            return Ok();
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
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
