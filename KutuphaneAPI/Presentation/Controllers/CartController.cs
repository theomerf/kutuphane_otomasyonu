using Entities.Dtos;
using Entities.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Contracts;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public CartController(IServiceManager manager)
        {
            _manager = manager;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _manager.CartService.GetCartByUserIdAsync(userId!);

            return Ok(cart);
        }

        [Authorize]
        [HttpPost("addline")]
        public async Task<IActionResult> AddLineToCart([FromBody] CartLineDto cartLineDto)
        {
            var cart = await _manager.CartService.AddLineAsync(cartLineDto);
            return CreatedAtAction(nameof(GetCart), null, cart);
        }

        [Authorize]
        [HttpDelete("removeline/{cartLineId}")]
        public async Task<IActionResult> RemoveLineFromCart([FromRoute] int cartLineId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _manager.CartService.RemoveLineAsync(userId!, cartLineId);

            return Ok(cart);
        }

        [Authorize]
        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _manager.CartService.ClearCartAsync(userId!);

            return Ok(cart);
        }

        [Authorize]
        [HttpPatch("cartlines/increase/{cartLineId}")]
        public async Task<IActionResult> IncreaseQuantity([FromRoute] int cartLineId, [FromBody] QuantityUpdateDto cartDto)
        {
            var cartLine = await _manager.CartService.IncreaseQuantityAsync(cartLineId, cartDto.Quantity);
            return Ok(cartLine);
        }

        [Authorize]
        [HttpPatch("cartlines/decrease/{cartLineId}")]
        public async Task<IActionResult> DecreaseQuantity([FromRoute] int cartLineId, [FromBody] QuantityUpdateDto cartDto)
        {
            var cartLine = await _manager.CartService.DecreaseQuantityAsync(cartLineId, cartDto.Quantity);
            return Ok(cartLine);
        }
    }
}
