using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Security.Claims;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/books")]
    public class BooksAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public BooksAdminController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateBook([FromForm] BookDtoForCreation bookDto)
        {
            var newFilePaths = new List<string>();
            if (bookDto.NewImages != null && bookDto.NewImages.Count > 0)
            {
                var count = await _manager.BookService.GetAllBooksCountAsync();
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/books");

                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                foreach (var file in bookDto.NewImages)
                {
                    var uniqueFileName = $"{count + 1}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                    var filePath = Path.Combine(uploadPath, uniqueFileName);
                    newFilePaths.Add(filePath);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }
            }

            await _manager.BookService.CreateBookAsync(bookDto, newFilePaths);

            return Ok();
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateBook([FromForm] BookDtoForUpdate bookDto)
        {
            var newFilePaths = new List<string>();
            if (bookDto.NewImages != null && bookDto.NewImages.Count > 0)
            {
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/books");

                if (!Directory.Exists(uploadPath))
                {
                    Directory.CreateDirectory(uploadPath);
                }

                foreach (var file in bookDto.NewImages)
                {
                    var uniqueFileName = $"{bookDto.Id}_{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                    var filePath = Path.Combine(uploadPath, uniqueFileName);
                    newFilePaths.Add($"books/{uniqueFileName}");

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }
            }

            await _manager.BookService.UpdateBookAsync(bookDto, newFilePaths);

            return Ok(new { message = "Kitap başarıyla güncellendi." });
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteBook([FromRoute] int id)
        {
            await _manager.BookService.DeleteBookAsync(id);

            return Ok();
        }
    }
}
