using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class CartManager : ICartService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public CartManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }

        public async Task<CartDto> GetCartByUserIdAsync(string userId)
        {
            var cart = await GetCartByUserIdForServiceAsync(userId, false);
            var cartDto = _mapper.Map<CartDto>(cart);

            return cartDto;
        }

        private async Task<Cart> GetCartByUserIdForServiceAsync(string userId, bool trackChanges)
        {
            var cart = await _manager.Cart.GetCartByUserIdAsync(userId, trackChanges);

            if (cart == null)
            {
                var newCart = new Cart
                {
                    AccountId = userId
                };

                _manager.Cart.CreateCart(newCart);
                await _manager.SaveAsync();

                return newCart;
            }

            return cart;
        }

        private async Task<CartLine> GetCartLineByIdForServiceAsync(int cartLineId, bool trackChanges)
        {
            var cartLine = await _manager.Cart.GetCartLineByIdAsync(cartLineId, trackChanges);

            if (cartLine == null)
            {
                throw new CartLineNotFoundException(cartLineId);
            }

            return cartLine;
        }

        public async Task<CartDto> AddLineAsync(CartLineDto cartDto)
        {
            var cart = await GetCartByUserIdForServiceAsync(cartDto.Cart?.AccountId!, true);
            var cartLine = _mapper.Map<CartLine>(cartDto);

            cart.CartLines.Add(cartLine);
            await _manager.SaveAsync();

            var cartDtoResult = _mapper.Map<CartDto>(cart);
            return cartDtoResult;
        }

        public async Task<CartDto> ClearCartAsync(string userId)
        {
            var cart = await GetCartByUserIdForServiceAsync(userId, true);

            cart.CartLines.Clear();
            await _manager.SaveAsync();

            var cartDto = _mapper.Map<CartDto>(cart);
            return cartDto;
        }

        public async Task<CartLineDto> DecreaseQuantityAsync(int cartLineId, int quantity)
        {
            var cartLine = await GetCartLineByIdForServiceAsync(cartLineId, true);

            cartLine.Quantity -= quantity;
            await _manager.SaveAsync();

            var cartLineDtoResult = _mapper.Map<CartLineDto>(cartLine);
            return cartLineDtoResult;
        }

        public async Task<CartLineDto> IncreaseQuantityAsync(int cartLineId, int quantity)
        {
            var cartLine = await GetCartLineByIdForServiceAsync(cartLineId, true);

            cartLine.Quantity += quantity;
            await _manager.SaveAsync();

            var cartLineDtoResult = _mapper.Map<CartLineDto>(cartLine);
            return cartLineDtoResult;
        }

        public async Task<CartDto> RemoveLineAsync(string userId, int cartLineId)
        {
            var cart = await GetCartByUserIdForServiceAsync(userId, true);
            cart.CartLines.RemoveAll(cl => cl.Id == cartLineId);

            await _manager.SaveAsync();

            var cartDto = _mapper.Map<CartDto>(cart);
            return cartDto;
        }
    }
}
