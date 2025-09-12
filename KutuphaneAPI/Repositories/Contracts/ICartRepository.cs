using Entities.Models;

namespace Repositories.Contracts
{
    public interface ICartRepository : IRepositoryBase<Cart>
    {
        public Task<Cart?> GetCartByUserIdAsync(string userId, bool trackChanges);
        public Task<CartLine?> GetCartLineByIdAsync(int cartLineId, bool trackChanges);
        public void CreateCart(Cart cart);
        public void DeleteCart(Cart cart);
        public void UpdateCart(Cart cart);
    }
}
