using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class AccountRepository : RepositoryBase<Account>, IAccountRepository
    {
        public AccountRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Account> accounts, int count)> GetAllAccountsAsync(AdminRequestParameters p, bool trackChanges)
        {
            var query = FindAll(trackChanges)
                .FilterBy(p.SearchTerm, a => a.UserName, FilterOperator.Contains)
                .OrderBy(a => a.Id);

            var accounts = await query
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            var count = await query.CountAsync();

            return (accounts, count);
        }

        public async Task<int> GetAllAccountsCountAsync() => await CountAsync(false);
    }
}
