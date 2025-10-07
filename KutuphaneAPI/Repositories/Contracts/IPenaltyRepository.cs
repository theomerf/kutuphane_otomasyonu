using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface IPenaltyRepository : IRepositoryBase<Penalty>
    {
        Task<(IEnumerable<Penalty> penalties, int count)> GetAllPenaltiesAsync(AdminRequestParameters p, bool trackChanges);
        Task<int> GetAllPenaltiesCountAsync();
        Task<Penalty?> GetOnePenaltyByIdAsync(int id, bool trackChanges);
        Task<IEnumerable<Penalty>> GetPenaltiesByAccountIdAsync(string accountId, bool trackChanges);
        void CreatePenalty(Penalty penalty);
        void UpdatePenalty(Penalty penalty);
        void DeletePenalty(Penalty penalty);
    }
}
