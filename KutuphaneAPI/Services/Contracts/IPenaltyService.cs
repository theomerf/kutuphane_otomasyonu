using Entities.Dtos;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface IPenaltyService
    {
        Task<(IEnumerable<PenaltyDto> penalties, MetaData metaData)> GetAllPenaltiesAsync(AdminRequestParameters p, bool trackChanges);
        Task<int> GetAllPenaltiesCountAsync();
        Task<PenaltyDto> GetOnePenaltyByIdAsync(int id, bool trackChanges);
        Task<IEnumerable<PenaltyDto>> GetPenaltiesByAccountIdAsync(string accountId, bool trackChanges);
        Task CreatePenaltyAsync(PenaltyDto penaltyDto);
        Task PenaltyPaidAsync(int penaltyId);
        Task UpdatePenaltyAsync(PenaltyDto penaltyDto);
        Task DeletePenaltyAsync(int penaltyId);
    }
}
