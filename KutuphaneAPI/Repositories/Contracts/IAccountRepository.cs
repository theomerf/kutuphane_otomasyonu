using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface IAccountRepository : IRepositoryBase<Account>
    {
        Task<(IEnumerable<Account> accounts, int count)> GetAllAccountsAsync(AdminRequestParameters p, bool trackChanges);
        Task<int> GetAllAccountsCountAsync();
        Task<AccountDtoForFavorites?> GetAccountFavoritesAsync(string userId);
    }
}
