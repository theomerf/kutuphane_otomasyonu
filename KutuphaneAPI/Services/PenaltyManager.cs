using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class PenaltyManager : IPenaltyService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;
        private readonly ILoanService _loanService;

        public PenaltyManager(IRepositoryManager manager, IMapper mapper, INotificationService notificationService, ILoanService loanService)
        {
            _manager = manager;
            _mapper = mapper;
            _notificationService = notificationService;
            _loanService = loanService;
        }

        public async Task<(IEnumerable<PenaltyDto> penalties, MetaData metaData)> GetAllPenaltiesAsync(AdminRequestParameters p, bool trackChanges)
        {
            var penalties = await _manager.Penalty.GetAllPenaltiesAsync(p, trackChanges);
            var penaltiesDto = _mapper.Map<IEnumerable<PenaltyDto>>(penalties.penalties);
            var pagedPenalties = PagedList<PenaltyDto>.ToPagedList(penaltiesDto, p.PageNumber, p.PageSize, penalties.count);

            return (pagedPenalties, pagedPenalties.MetaData);
        }

        public async Task<int> GetAllPenaltiesCountAsync() => await _manager.Penalty.GetAllPenaltiesCountAsync();

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
            _manager.Account.Attach(penalty.Account!);

            var loanDto = await _loanService.GetOneLoanByIdAsync(penaltyDto.LoanId, false);
            var loan = _mapper.Map<Loan>(loanDto);
            loan.Status = LoanStatus.Overdue;
            loan.FineAmount = penalty.Amount;
            _manager.Loan.Entry(loan).Property(p => p.FineAmount).IsModified = true;
            _manager.Loan.Entry(loan).Property(p => p.Status).IsModified = true;

            await _manager.SaveAsync();

            var notificationDto = new NotificationDtoForCreation()
            {
                AccountId = penaltyDto.AccountId,
                Title = "Yeni Ceza",
                Message = $"Yeni bir {penalty.Reason} cezanız bulunmaktadır. Ceza miktarı: {penalty.Amount}₺.",
                Type = NotificationType.Alert
            };

            await _notificationService.CreateNotificationAsync(notificationDto);
        }

        public async Task PenaltyPaidAsync(int penaltyId)
        {
            var penalty = await GetOnePenaltyByIdForServiceAsync(penaltyId, true);
            penalty.IsPaid = true;
            _manager.Account.Detach(penalty.Account!);
            _manager.Penalty.Entry(penalty).Property(p => p.IsPaid).IsModified = true;

            var loanDto = await _loanService.GetOneLoanByIdAsync(penalty.LoanId, false);
            var loan = _mapper.Map<Loan>(loanDto);
            _manager.Loan.Attach(loan);
            loan.FineAmount = 0;

            await _manager.SaveAsync();

            var notificationDto = new NotificationDtoForCreation()
            {
                AccountId = penalty.AccountId,
                Title = "Cezanız Ödendi",
                Message = $"Cezanızın ödendiği onaylanmıştır. Teşekkür ederiz!",
                Type = NotificationType.Info
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
