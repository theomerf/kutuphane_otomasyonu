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

        public async Task<CartDto> MergeCartsAsync(string userId, CartDto cartDto)
        {
            var cartFromRepo = await GetCartByUserIdForUpdateAsync(userId, false);

            if (cartFromRepo?.CartLines != null && cartFromRepo.CartLines.Any())
            {
                var mergedCart = _mapper.Map<Cart>(cartFromRepo);
                _manager.Cart.Attach(mergedCart);

                foreach (var line in cartDto.CartLines ?? Enumerable.Empty<CartLineDto>())
                {
                    var existingLine = mergedCart.CartLines.FirstOrDefault(cl => cl.BookId == line.BookId);
                    if (existingLine != null)
                    {
                        existingLine.Quantity += line.Quantity;
                    }
                    else
                    {
                        var newLine = _mapper.Map<CartLine>(line);
                        newLine.Id = 0;
                        mergedCart.CartLines.Add(newLine);
                        _manager.Book.Attach(newLine.Book!);
                    }
                }
                await _manager.SaveAsync();
                var cartDtoResult = await GetCartByUserIdForServiceAsync(userId, false);
                return cartDtoResult!;
            }
            else
            {
                var mergedCart = _mapper.Map<Cart>(cartDto);
                mergedCart.AccountId = userId;
                mergedCart.Id = cartFromRepo!.Id;
                _manager.Cart.Attach(mergedCart);
                await _manager.SaveAsync();
                
                return _mapper.Map<CartDto>(mergedCart);
            }
        }

        private async Task<CartDto?> GetCartByUserIdForServiceAsync(string userId, bool trackChanges)
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

                return _mapper.Map<CartDto>(newCart);
            }

            return cart;
        }

        private async Task<CartDtoForUpdate?> GetCartByUserIdForUpdateAsync(string userId, bool trackChanges)
        {
            var cart = await _manager.Cart.GetCartForUpdateAsync(userId, trackChanges);

            if (cart == null)
            {
                var newCart = new Cart
                {
                    AccountId = userId
                };

                _manager.Cart.CreateCart(newCart);
                await _manager.SaveAsync();

                return _mapper.Map<CartDtoForUpdate>(newCart);
            }

            return cart;
        }

        private async Task<CartLine?> GetCartLineByIdForServiceAsync(int cartLineId, bool trackChanges)
        {
            var cartLine = await _manager.Cart.GetCartLineByIdAsync(cartLineId, trackChanges);

            if (cartLine == null)
            {
                throw new CartLineNotFoundException(cartLineId);
            }

            return cartLine;
        }

        public async Task<CartDto> AddLineAsync(CartLineDto cartDto, string userId)
        {
            var cartFromRepo = await GetCartByUserIdForUpdateAsync(userId, false);
            if (cartFromRepo?.CartLines != null && cartFromRepo.CartLines.Any(cl => cl.BookId == cartDto.BookId))
            {
                var existingLine = cartFromRepo.CartLines.First(cl => cl.BookId == cartDto.BookId);
                existingLine.Quantity += cartDto.Quantity;
            }
            var cart = _mapper.Map<Cart>(cartFromRepo);
            _manager.Cart.Attach(cart);

            var cartLine = _mapper.Map<CartLine>(cartDto);
            cart.CartLines.Add(cartLine);
            _manager.Book.Attach(cartLine.Book!);

            await _manager.SaveAsync();

            var cartDtoResult = await GetCartByUserIdForServiceAsync(userId, false);
            return cartDtoResult!;
        }

        public async Task<CartDto> RemoveLineAsync(string userId, int cartLineId)
        {
            var cart = await GetCartByUserIdForUpdateAsync(userId, true);
            var cartLineToDelete = cart?.CartLines?.Where(cl => cl.Id == cartLineId).FirstOrDefault();

            if (cartLineToDelete == null) throw new CartLineNotFoundException(cartLineId);
            var cartLineEntity = _mapper.Map<CartLine>(cartLineToDelete);

            _manager.Cart.DeleteCartLine(cartLineEntity);

            await _manager.SaveAsync();

            var cartDto = await GetCartByUserIdForServiceAsync(userId, false);
            return cartDto!;
        }

        public async Task<CartDto> ClearCartAsync(string userId)
        {
            var cart = await GetCartByUserIdForUpdateAsync(userId, true);

            foreach (var line in cart?.CartLines ?? Enumerable.Empty<CartLineDtoForUpdate>())
            {
                var cartLineEntity = _mapper.Map<CartLine>(line);
                _manager.Cart.DeleteCartLine(cartLineEntity);
            }
            cart?.CartLines?.Clear();
            await _manager.SaveAsync();

            var cartDto = new CartDto
            {
                Id = cart!.Id,
                AccountId = cart.AccountId,
                CartLines = new List<CartLineDto>()
            };
            return cartDto;
        }

        public async Task<CartLineDto> DecreaseQuantityAsync(int cartLineId, int quantity)
        {
            var cartLine = await GetCartLineByIdForServiceAsync(cartLineId, true);

            cartLine!.Quantity -= quantity;
            await _manager.SaveAsync();

            var cartLineDtoResult = _mapper.Map<CartLineDto>(cartLine);
            return cartLineDtoResult;
        }

        public async Task<CartLineDto> IncreaseQuantityAsync(int cartLineId, int quantity)
        {
            var cartLine = await GetCartLineByIdForServiceAsync(cartLineId, true);

            cartLine!.Quantity += quantity;
            await _manager.SaveAsync();

            var cartLineDtoResult = _mapper.Map<CartLineDto>(cartLine);
            return cartLineDtoResult;
        }
    }
}
