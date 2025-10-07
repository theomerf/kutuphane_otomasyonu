using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class PenaltyRepository : RepositoryBase<Penalty>, IPenaltyRepository
    {
        public PenaltyRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Penalty> penalties, int count)> GetAllPenaltiesAsync(AdminRequestParameters p, bool trackChanges)
        {
            var penaltiesQuery = FindAll(trackChanges)
                .Include(p => p.Account)
                .FilterBy(p.SearchTerm, p => p.Account!.UserName, FilterOperator.Contains)
                .OrderByDescending(p => p.IssuedDate);

            var penalties = await penaltiesQuery
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            var count = await penaltiesQuery.CountAsync();

            return (penalties, count);
        }

        public async Task<int> GetAllPenaltiesCountAsync() => await FindAll(false).CountAsync();

        public async Task<IEnumerable<Penalty>> GetPenaltiesByAccountIdAsync(string accountId, bool trackChanges)
        {
            var penalties = await FindByCondition(p => p.AccountId == accountId, trackChanges)
                .Include(p => p.Account)
                .ToListAsync();

            return penalties;
        }

        public async Task<Penalty?> GetOnePenaltyByIdAsync(int id, bool trackChanges)
        {
            var penalty = await FindByCondition(p => p.Id == id, trackChanges)
                .Include(p => p.Account)
                .FirstOrDefaultAsync();

            return penalty;
        }

        public void CreatePenalty(Penalty penalty)
        {
            Create(penalty);
        }

        public void DeletePenalty(Penalty penalty)
        {
            Remove(penalty);
        }


        public void UpdatePenalty(Penalty penalty)
        {
            Update(penalty);
        }
    }
}
