using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class PenaltyRepository : RepositoryBase<Penalty>, IPenaltyRepository
    {
        public PenaltyRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Penalty>> GetAllPenaltiesAsync(bool trackChanges)
        {
            var penalties = await FindAll(trackChanges)
                .Include(p => p.Account)
                .ToListAsync();

            return penalties;
        }

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
