using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class CartRepository : RepositoryBase<Cart>, ICartRepository
    {
        public CartRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<Cart?> GetCartByUserIdAsync(string userId, bool trackChanges)
        {
            var cart = await FindByCondition(c => c.AccountId == userId, trackChanges)
                .Include(c => c.CartLines)
                .FirstOrDefaultAsync();

            return cart;
        }

        public async Task<CartLine?> GetCartLineByIdAsync(int cartLineId, bool trackChanges)
        {
            var cartLine = await FindByCondition(c => c.CartLines.Any(cl => cl.Id == cartLineId), trackChanges)
                .SelectMany(c => c.CartLines)
                .FirstOrDefaultAsync();

            return cartLine;
        }

        public void CreateCart(Cart cart)
        {
            Create(cart);
        }

        public void DeleteCart(Cart cart)
        {
            Remove(cart);
        }

        public void UpdateCart(Cart cart)
        {
            Update(cart);
        }
    }
}
