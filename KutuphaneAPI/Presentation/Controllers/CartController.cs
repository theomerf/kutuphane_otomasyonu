using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Security.Claims;

namespace Presentation.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public CartController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _manager.CartService.GetCartByUserIdAsync(userId!);

            return Ok(cart);
        }

        [HttpPost("merge")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> MergeCarts([FromBody] CartDtoForUpdate cartDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _manager.CartService.MergeCartsAsync(userId!, cartDto);

            return Ok(cart);
        }

        [HttpPost("addline")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> AddLineToCart([FromBody] CartLineDtoForInsertion cartLineDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _manager.CartService.AddLineAsync(cartLineDto, userId!);
            return CreatedAtAction(nameof(GetCart), null, cart);
        }

        [HttpDelete("removeline/{cartLineId}")]
        public async Task<IActionResult> RemoveLineFromCart([FromRoute] int cartLineId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _manager.CartService.RemoveLineAsync(userId!, cartLineId);

            return Ok(cart);
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _manager.CartService.ClearCartAsync(userId!);

            return Ok(cart);
        }

        [HttpPatch("increase/{cartLineId}")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> IncreaseQuantity([FromRoute] int cartLineId, [FromBody] QuantityUpdateDto cartDto)
        {
            var cartLine = await _manager.CartService.IncreaseQuantityAsync(cartLineId, cartDto.Quantity);
            return Ok(cartLine);
        }

        [HttpPatch("decrease/{cartLineId}")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> DecreaseQuantity([FromRoute] int cartLineId, [FromBody] QuantityUpdateDto cartDto)
        {
            var cartLine = await _manager.CartService.DecreaseQuantityAsync(cartLineId, cartDto.Quantity);
            return Ok(cartLine);
        }
    }
}
