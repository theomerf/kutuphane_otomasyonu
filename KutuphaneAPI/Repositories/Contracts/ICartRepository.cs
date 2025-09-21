using Entities.Dtos;
using Entities.Models;

namespace Repositories.Contracts
{
    public interface ICartRepository : IRepositoryBase<Cart>
    {
        public Task<CartDto?> GetCartByUserIdAsync(string userId, bool trackChanges);
        Task<CartDtoForUpdate?> GetCartForUpdateAsync(string userId, bool trackChanges);
        public Task<CartLine?> GetCartLineByIdAsync(int cartLineId, bool trackChanges);
        void DeleteAllCartLines(IEnumerable<CartLine> cartLines);
        void DeleteCartLine(CartLine cartLine);
        public void CreateCart(Cart cart);
        public void DeleteCart(Cart cart);
        public void UpdateCart(Cart cart);
    }
}
