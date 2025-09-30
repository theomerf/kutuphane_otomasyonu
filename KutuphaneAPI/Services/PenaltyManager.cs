using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class PenaltyManager : IPenaltyService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public PenaltyManager(IRepositoryManager manager, IMapper mapper, INotificationService notificationService)
        {
            _manager = manager;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        public async Task<IEnumerable<PenaltyDto>> GetAllPenaltiesAsync(bool trackChanges)
        {
            var penalties = await _manager.Penalty.GetAllPenaltiesAsync(trackChanges);
            var penaltiesDto = _mapper.Map<IEnumerable<PenaltyDto>>(penalties);

            return penaltiesDto;
        }

        public async Task<IEnumerable<PenaltyDto>> GetPenaltiesByAccountIdAsync(string accountId, bool trackChanges)
        {
            var penalties = await _manager.Penalty.GetPenaltiesByAccountIdAsync(accountId, trackChanges);
            var penaltiesDto = _mapper.Map<IEnumerable<PenaltyDto>>(penalties);

            return penaltiesDto;
        }

        public async Task<PenaltyDto> GetOnePenaltyByIdAsync(int id, bool trackChanges)
        {
            var penalty = await GetOnePenaltyByIdForServiceAsync(id, trackChanges);
            var penaltyDto = _mapper.Map<PenaltyDto>(penalty);

            return penaltyDto;
        }

        private async Task<Penalty> GetOnePenaltyByIdForServiceAsync(int id, bool trackChanges)
        {
            var penalty = await _manager.Penalty.GetOnePenaltyByIdAsync(id, trackChanges);
            if (penalty is null)
            {
                throw new PenaltyNotFoundException(id);
            }

            return penalty;
        }
        public async Task CreatePenaltyAsync(PenaltyDto penaltyDto)
        {
            var penalty = _mapper.Map<Penalty>(penaltyDto);

            _manager.Penalty.CreatePenalty(penalty);
            await _manager.SaveAsync();

            var notificationDto = new NotificationDtoForCreation()
            {
                AccountId = penaltyDto.AccountId,
                Title = "Yeni Ceza",
                Message = $"Yeni bir kitap gecikme cezanız bulunmaktadır. Ceza miktarı: {penaltyDto.Amount}.",
                Type = NotificationType.Alert
            };

            await _notificationService.CreateNotificationAsync(notificationDto);
        }

        public async Task DeletePenaltyAsync(int penaltyId)
        {
            var penalty = await GetOnePenaltyByIdForServiceAsync(penaltyId, false);

            _manager.Penalty.DeletePenalty(penalty);
            await _manager.SaveAsync();
        }

        public async Task UpdatePenaltyAsync(PenaltyDto penaltyDto)
        {
            var penalty = await GetOnePenaltyByIdForServiceAsync(penaltyDto.Id, false);

            _mapper.Map(penaltyDto, penalty);
            _manager.Penalty.UpdatePenalty(penalty);
            await _manager.SaveAsync();
        }
    }
}
