using Entities.Dtos;
using Microsoft.AspNetCore.Identity;

namespace Services.Contracts
{
    public interface IAccountService
    {
        Task<IdentityResult> RegisterUserAsync(AccountForRegistrationDto accountDto);
        Task<bool> LoginUserAsync(AccountForLoginDto accountDto);
        Task<TokenDto> CreateTokenAsync(bool populateExp, bool rememberMe);
        Task<TokenDto> RefreshTokenAsync(TokenDto tokenDto);
        Task<AccountDto> GetUserByIdAsync(String userName);
    }
}
