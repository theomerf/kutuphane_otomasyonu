using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Identity;

namespace Services.Contracts
{
    public interface IAccountService
    {
        Task<IdentityResult> RegisterUserAsync(AccountDtoForRegistration accountDto);
        Task<bool> LoginUserAsync(AccountDtoForLogin accountDto);
        Task<TokenDto> CreateTokenAsync(bool populateExp, bool rememberMe);
        Task<TokenDto> RefreshTokenAsync(TokenDto tokenDto);
        Task<AccountDto> GetAccountByIdAsync(string userId);
        Task<IdentityResult> CreateAccountAsync(AccountDtoForCreation accountDto);
        Task<IdentityResult> ResetPasswordAsync(AccountDtoForPassword accountDto);
        Task<IdentityResult> UpdateAccountAsync(AccountDtoForUpdate accountDto);
        Task<IdentityResult> DeleteAccountAsync(string userId);
        Task<(IEnumerable<AccountDto> accounts, MetaData metaData)> GetAllAccountsAsync(AdminRequestParameters p, bool trackChanges);
        Task<int> GetAllAccountsCountAsync();
        IEnumerable<String> GetAllRoles();
    }
}
