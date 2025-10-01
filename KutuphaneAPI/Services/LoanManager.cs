using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class LoanManager : ILoanService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly INotificationService _notificationService;

        public LoanManager(IRepositoryManager manager, IMapper mapper, INotificationService notificationService)
        {
            _manager = manager;
            _mapper = mapper;
            _notificationService = notificationService;
        }

        public async Task<(IEnumerable<LoanDto> loans, MetaData metaData)> GetAllLoansAsync(AdminRequestParameters p, bool trackChanges)
        {
            var loans = await _manager.Loan.GetAllLoansAsync(p, trackChanges);
            var loansDto = _mapper.Map<IEnumerable<LoanDto>>(loans.loans);

            var pagedLoans = PagedList<LoanDto>.ToPagedList(loansDto, p.PageNumber, p.PageSize, loans.count);

            return (pagedLoans, pagedLoans.MetaData);
        }

        public async Task<int> GetAllLoansCountAsync()
        {
            var count = await _manager.Loan.GetAllLoansCountAsync();

            return count;
        }

        public async Task<IEnumerable<LoanDto>> GetLoansByAccountIdAsync(string accountId, bool trackChanges)
        {
            var loans = await _manager.Loan.GetLoansByAccountIdAsync(accountId, trackChanges);
            var loansDto = _mapper.Map<IEnumerable<LoanDto>>(loans);

            return loansDto;
        }

        public async Task<LoanDto> GetOneLoanByIdAsync(int id, bool trackChanges)
        {
            var loan = await GetOneLoanByIdForServiceAsync(id, trackChanges);
            var loanDto = _mapper.Map<LoanDto>(loan);

            return loanDto;
        }

        private async Task<Loan> GetOneLoanByIdForServiceAsync(int id, bool trackChanges)
        {
            var loan =  await _manager.Loan.GetOneLoanByIdAsync(id, trackChanges);
            if (loan is null)
            {
                throw new LoanNotFoundException(id);
            }

            return loan;
        }

        public async Task ChangeStatusOfLoanAsync(int loanId, LoanStatus status)
        {
            var loan = await GetOneLoanByIdForServiceAsync(loanId, true);

            if (status == LoanStatus.Canceled || status == LoanStatus.Returned)
            {
                foreach (var line in loan.LoanLines!)
                {
                    var book = await _manager.Book.GetOneBookAsync(line.BookId, false);
                    if (book is null)
                    {
                        throw new BookNotFoundException(line.BookId);
                    }
                    _manager.Book.Attach(line.Book!);
                    book.AvailableCopies += line.Quantity;
                    line.Book!.AvailableCopies = book.AvailableCopies;
                }
            }

            if (status == LoanStatus.Returned)
            {
                loan.ReturnDate = DateTime.UtcNow;
            }

            loan.Status = status;

            _manager.Loan.UpdateLoan(loan);
            await _manager.SaveAsync();

            if (status == LoanStatus.Canceled)
            {
                var notificationDto = new NotificationDtoForCreation()
                {
                    AccountId = loan.AccountId,
                    Title = "Kiralamanız İptal Edildi",
                    Message = "Kitap kiralamanız iptal edildi. Detaylar için desteğe ulaşın.",
                    Type = NotificationType.Warning
                };

                await _notificationService.CreateNotificationAsync(notificationDto);
            }
            else if (status == LoanStatus.Returned)
            {
                var notificationDto = new NotificationDtoForCreation()
                {
                    AccountId = loan.AccountId,
                    Title = "Kitap İadesi Onaylandı",
                    Message = "Kitaplarınızı iade ettiğiniz için teşekkür ederiz. Tekrar görüşmek üzere!",
                    Type = NotificationType.Info
                };
                await _notificationService.CreateNotificationAsync(notificationDto);
            }
            else if (status == LoanStatus.Overdue)
            {
                var notificationDto = new NotificationDtoForCreation()
                {
                    AccountId = loan.AccountId,
                    Title = "Kiralamanız Gecikti",
                    Message = "Kiraladığınız kitapları zamanında iade etmediniz. Lütfen en kısa sürede iade ediniz.",
                    Type = NotificationType.Alert
                };
                await _notificationService.CreateNotificationAsync(notificationDto);
            }
        }
        public async Task CreateLoanAsync(LoanDto loanDto)
        {
            var loan = _mapper.Map<Loan>(loanDto);

            foreach (var line in loan.LoanLines!)
            {
                var book = await _manager.Book.GetOneBookAsync(line.BookId, false);
                if (book is null)
                {
                    throw new BookNotFoundException(line.BookId);
                }
                if (book.AvailableCopies < line.Quantity)
                {
                    throw new InsufficientBookCopiesException(book.Title!, book.AvailableCopies, line.Quantity);
                }
                _manager.Book.Attach(line.Book!);
                book.AvailableCopies -= line.Quantity;
                line.Book!.AvailableCopies = book.AvailableCopies;
            }

            _manager.Loan.CreateLoan(loan);
            await _manager.SaveAsync();

            var notificationDto = new NotificationDtoForCreation()
            {
                AccountId = loanDto.AccountId,
                Title = "Yeni Kitap Kiralama",
                Message = "Kitap kiralamanız oluşturuldu. Kütüphaneden kitapları teslim alabilirsiniz.",
                Type = NotificationType.Info
            };

            await _notificationService.CreateNotificationAsync(notificationDto);
        }

        public async Task DeleteLoanAsync(int loanId)
        {
            var loan = await GetOneLoanByIdForServiceAsync(loanId, true);

            _manager.Loan.DeleteLoan(loan);
            await _manager.SaveAsync();
        }

        public async Task DeleteLoanForUserAsync(int loanId, string accountId)
        {
            var loan = await GetOneLoanByIdForServiceAsync(loanId, false);
            if (loan.AccountId != accountId)
            {
                throw new AccessViolationException("Bu kiralamayı silmek için yetkiniz bulunmamaktadır.");
            }

            foreach (var line in loan.LoanLines!)
            {
                var book = await _manager.Book.GetOneBookAsync(line.BookId, false);
                if (book is null)
                {
                    throw new BookNotFoundException(line.BookId);
                }
                _manager.Book.Attach(line.Book!);
                book.AvailableCopies += line.Quantity;
                line.Book!.AvailableCopies = book.AvailableCopies;
            }

            _manager.Loan.DeleteLoan(loan);
            await _manager.SaveAsync();
        }

        public async Task UpdateLoanAsync(LoanDto loanDto)
        {
            var loan = await GetOneLoanByIdForServiceAsync(loanDto.Id, false);

            _mapper.Map(loanDto, loan);
            _manager.Loan.UpdateLoan(loan);
            await _manager.SaveAsync();
        }
    }
}

