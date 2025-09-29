using Repositories.Contracts;

namespace Repositories
{
    public class RepositoryManager : IRepositoryManager
    {
        private readonly RepositoryContext _context;
        private readonly IBookRepository _bookRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IAuthorRepository _authorRepository;
        private readonly ITagRepository _tagRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IReservationRepository _reservationRepository;
        private readonly ISeatRepository _seatRepository;
        private readonly ILoanRepository _loanRepository;
        private readonly IPenaltyRepository _penaltyRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly IUserReviewRepository _userReviewRepository;
        private readonly INotificationRepository _notificationRepository;

        public RepositoryManager(RepositoryContext context, IBookRepository bookRepository, ICategoryRepository categoryRepository, IAuthorRepository authorRepository, ICartRepository cartRepository, IReservationRepository reservationRepository, ISeatRepository seatRepository, ILoanRepository loanRepository, IPenaltyRepository penaltyRepository, ITagRepository tagRepository, IAccountRepository accountRepository, IUserReviewRepository userReviewRepository, INotificationRepository notificationRepository)
        {
            _context = context;
            _bookRepository = bookRepository;
            _categoryRepository = categoryRepository;
            _authorRepository = authorRepository;
            _cartRepository = cartRepository;
            _reservationRepository = reservationRepository;
            _seatRepository = seatRepository;
            _loanRepository = loanRepository;
            _penaltyRepository = penaltyRepository;
            _tagRepository = tagRepository;
            _accountRepository = accountRepository;
            _userReviewRepository = userReviewRepository;
            _notificationRepository = notificationRepository;
        }

        public IBookRepository Book => _bookRepository;
        public ICategoryRepository Category => _categoryRepository;
        public IAuthorRepository Author => _authorRepository;
        public ITagRepository Tag => _tagRepository;
        public ICartRepository Cart => _cartRepository;
        public IReservationRepository Reservation => _reservationRepository;
        public ISeatRepository Seat => _seatRepository;
        public ILoanRepository Loan => _loanRepository;
        public IPenaltyRepository Penalty => _penaltyRepository;
        public IAccountRepository Account => _accountRepository;
        public IUserReviewRepository UserReview => _userReviewRepository;
        public INotificationRepository Notification => _notificationRepository;

        public void Save()
        {
            _context.SaveChanges();
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
