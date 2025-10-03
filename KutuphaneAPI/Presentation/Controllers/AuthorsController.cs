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
    public class AuthorsController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public AuthorsController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet("nopagination")]
        public async Task<IActionResult> GetAllAuthorsWithoutPagination()
        {
            var authors = await _manager.AuthorService.GetAllAuthorsWithoutPaginationAsync(false);
            return Ok(authors);
        }

        [HttpGet("popular")]
        public async Task<IActionResult> GetMostPopularAuthors()
        {
            var authors = await _manager.AuthorService.GetMostPopularAuthorsAsync(false);
            return Ok(authors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneAuthor([FromRoute] int id)
        {
            var author = await _manager.AuthorService.GetOneAuthorAsync(id, false);
            return Ok(author);
        }
    }
}
