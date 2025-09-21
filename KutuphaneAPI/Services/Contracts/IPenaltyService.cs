using Entities.Dtos;

namespace Services.Contracts
{
    public interface IPenaltyService
    {
        Task<IEnumerable<PenaltyDto>> GetAllPenaltiesAsync(bool trackChanges);
        Task<PenaltyDto> GetOnePenaltyByIdAsync(int id, bool trackChanges);
        Task<IEnumerable<PenaltyDto>> GetPenaltiesByAccountIdAsync(string accountId, bool trackChanges);
        Task CreatePenaltyAsync(PenaltyDto penaltyDto);
        Task UpdatePenaltyAsync(PenaltyDto penaltyDto);
        Task DeletePenaltyAsync(int penaltyId);
    }
}
