using Entities.RequestFeatures;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public CategoriesController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCategories([FromQuery] CategoryRequestParameters p)
        {
            var pagedResult = await _manager.CategoryService.GetAllCategoriesAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData));

            return Ok(pagedResult.categories);
        }

        [HttpGet("nopagination")]
        public async Task<IActionResult> GetAllCategoriesWithoutPagination()
        {
            var categories = await _manager.CategoryService.GetAllCategoriesWithoutPaginationAsync(false);
            return Ok(categories);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllCategoriesCount()
        {
            var count = await _manager.CategoryService.GetAllCategoriesCountAsync();

            return Ok(count);
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetMostPopularCategories()
        {
            var categories = await _manager.CategoryService.GetMostPopularCategoriesAsync(false);
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneCategory([FromRoute] int id)
        {
            var category = await _manager.CategoryService.GetOneCategoryAsync(id, false);
            return Ok(category);
        }
    }
}
