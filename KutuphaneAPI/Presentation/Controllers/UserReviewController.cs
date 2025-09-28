using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;
using System.Security.Claims;

namespace Presentation.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class UserReviewController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public UserReviewController(IServiceManager manager)
        {
            _manager = manager;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAllUserReviews()
        {
            var reviews = await _manager.UserReviewService.GetAllUserReviewsAsync(trackChanges: false);

            return Ok(reviews);
        }

        [HttpGet("book/{bookId}/count")]
        public async Task<IActionResult> GetUserReviewsCountByBookId([FromRoute] int bookId)
        {
            var reviewCount = await _manager.UserReviewService.GetUserReviewsCountByBookIdAsync(bookId);

            return Ok(reviewCount);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOneUserReviewById([FromRoute] int id)
        {
            var review = await _manager.UserReviewService.GetOneUserReviewByIdAsync(id, trackChanges: false);

            return Ok(review);
        }

        [HttpGet("book/{bookId}")]
        public async Task<IActionResult> GetUserReviewsByBookId([FromRoute] int bookId)
        {
            var reviews = await _manager.UserReviewService.GetUserReviewsByBookIdAsync(bookId, trackChanges: false);

            return Ok(reviews);
        }

        [Authorize]
        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetUserReviewsByAccountId([FromRoute] string accountId)
        {
            var reviews = await _manager.UserReviewService.GetUserReviewsByAccountIdAsync(accountId, trackChanges: false);

            return Ok(reviews);
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateUserReview([FromBody] UserReviewDtoForCreation userReviewDto)
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            userReviewDto.AccountId = accountId;

            await _manager.UserReviewService.CreateUserReview(userReviewDto);

            return Ok();
        }

        [Authorize]
        [HttpPut("update")]
        public async Task<IActionResult> UpdateUserReview([FromBody] UserReviewDtoForUpdate userReviewDto)
        {
            await _manager.UserReviewService.UpdateUserReview(userReviewDto);

            return Ok();
        }

        [Authorize]
        [HttpPut("delete/{id}")]
        public async Task<IActionResult> DeleteUserReview([FromRoute] int id)
        {
            await _manager.UserReviewService.DeleteUserReview(id);

            return NoContent();
        }
    }
}
