using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Text.Json;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BooksController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public BooksController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllBooks([FromQuery] BookRequestParameters p)
        {
            var pagedResult = await _manager.BookService.GetAllBooksAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedResult.metaData));

            return Ok(pagedResult.books);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllBooksCount()
        {
            var count = await _manager.BookService.GetAllBooksCountAsync();

            return Ok(count);
        }

        [HttpGet("related/{id}")]
        public async Task<IActionResult> GetRelatedBooks([FromRoute] int id, [FromQuery] BookRequestParameters p)
        {
            var result = await _manager.BookService.GetRelatedBooksAsync(id, p, false);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneBook([FromRoute] int id)
        {
            var book = await _manager.BookService.GetOneBookAsync(id, false);

            return Ok(book);
        }

        [Authorize]
        [HttpGet("account/favorites")]
        public async Task<IActionResult> GetFavoriteBooks([FromQuery] ICollection<int> ids)
        {
            var books = await _manager.BookService.GetFavoriteBooksAsync(ids, false);

            return Ok(books);
        }
    }
}
