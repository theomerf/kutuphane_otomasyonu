using Entities.Dtos;

namespace Services.Contracts
{
    public interface ICartService
    {
        Task<CartDto> GetCartByUserIdAsync(string userId);
        Task<CartDto> MergeCartsAsync(string userId, CartDto cartDto);
        Task<CartDto> AddLineAsync(CartLineDto cartDto, string userId);
        Task<CartDto> RemoveLineAsync(string userId, int cartLineId);
        Task<CartDto> ClearCartAsync(string userId);
        Task<CartLineDto> IncreaseQuantityAsync(int cartLineId, int quantity);
        Task<CartLineDto> DecreaseQuantityAsync(int cartLineId, int quantity);
    }
}
