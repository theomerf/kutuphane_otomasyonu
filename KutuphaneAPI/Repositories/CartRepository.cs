using Entities.Dtos;
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

        public async Task<CartDto?> GetCartByUserIdAsync(string userId, bool trackChanges)
        {
            var cart = await FindByCondition(c => c.AccountId == userId, trackChanges)
                .Include(c => c.CartLines)
                .ThenInclude(cl => cl.Book)
                .Select(b => new CartDto
                {
                    Id = b.Id,
                    AccountId = b.AccountId,
                    CartLines = b.CartLines.Select(cl => new CartLineDto
                    {
                        Id = cl.Id,
                        BookTitle = cl.Book!.Title,
                        BookAuthor = cl.Book.Authors!.First().Name,
                        BookImageUrl = cl.Book.Images!.First().ImageUrl,
                        BookISBN = cl.Book.ISBN,
                        CartId = cl.CartId,
                        BookId = cl.BookId,
                        Quantity = cl.Quantity
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return cart;
        }

        public async Task<CartDtoForUpdate?> GetCartForUpdateAsync(string userId, bool trackChanges)
        {
            var cart = await FindByCondition(c => c.AccountId == userId, trackChanges)
                .Include(c => c.CartLines)
                .Select(b => new CartDtoForUpdate
                {
                    Id = b.Id,
                    AccountId = b.AccountId,
                    CartLines = b.CartLines.Select(cl => new CartLineDtoForUpdate
                    {
                        Id = cl.Id,
                        CartId = cl.CartId,
                        BookId = cl.BookId,
                        Quantity = cl.Quantity
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return cart;
        }

        public async Task<CartLine?> GetCartLineByIdAsync(int cartLineId, bool trackChanges)
        {
            var cartLine = await FindByCondition(c => c.CartLines.Any(cl => cl.Id == cartLineId), trackChanges)
                .SelectMany(c => c.CartLines)
                .Where(cl => cl.Id == cartLineId)
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

        public void DeleteCartLine(CartLine cartLine)
        {
            _context.Set<CartLine>().Remove(cartLine);
        }

        public void UpdateCart(Cart cart)
        {
            Update(cart);
        }
    }
}
