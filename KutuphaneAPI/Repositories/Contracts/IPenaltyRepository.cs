using Entities.Models;

namespace Repositories.Contracts
{
    public interface IPenaltyRepository : IRepositoryBase<Penalty>
    {
        Task<IEnumerable<Penalty>> GetAllPenaltiesAsync(bool trackChanges);
        Task<Penalty?> GetOnePenaltyByIdAsync(int id, bool trackChanges);
        Task<IEnumerable<Penalty>> GetPenaltiesByAccountIdAsync(string accountId, bool trackChanges);
        void CreatePenalty(Penalty penalty);
        void UpdatePenalty(Penalty penalty);
        void DeletePenalty(Penalty penalty);
    }
}
