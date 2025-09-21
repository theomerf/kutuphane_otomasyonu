using Services.Contracts;

namespace Services
{
    public class ServiceManager : IServiceManager
    {
        private readonly IAccountService _accountService;
        private readonly IBookService _bookService;
        private readonly ICategoryService _categoryService;
        private readonly IAuthorService _authorService;
        private readonly ITagService _tagService;
        private readonly ICartService _cartService;
        private readonly IReservationService _reservationService;
        private readonly ISeatService _seatService;
        private readonly ILoanService _loanService;
        private readonly IPenaltyService _penaltyService;

        public ServiceManager(IAccountService accountService, IBookService bookService, ICategoryService categoryService, IAuthorService authorService, ICartService cartService, IReservationService reservationService, ISeatService seatService, ILoanService loanService, IPenaltyService penaltyService, ITagService tagService)
        {
            _accountService = accountService;
            _bookService = bookService;
            _categoryService = categoryService;
            _authorService = authorService;
            _cartService = cartService;
            _reservationService = reservationService;
            _seatService = seatService;
            _loanService = loanService;
            _penaltyService = penaltyService;
            _tagService = tagService;
        }

        public IAccountService AccountService => _accountService;
        public IBookService BookService => _bookService;
        public ICategoryService CategoryService => _categoryService;
        public IAuthorService AuthorService => _authorService;
        public ITagService TagService => _tagService;
        public ICartService CartService => _cartService;
        public IReservationService ReservationService => _reservationService;
        public ISeatService SeatService => _seatService;
        public ILoanService LoanService => _loanService;
        public IPenaltyService PenaltyService => _penaltyService;
    }
}
