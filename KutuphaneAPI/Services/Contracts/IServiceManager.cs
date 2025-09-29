namespace Services.Contracts
{
    public interface IServiceManager
    {
        IAccountService AccountService { get; }
        IBookService BookService { get; }
        ICategoryService CategoryService { get; }
        ITagService TagService { get; }
        IAuthorService AuthorService { get; }
        ICartService CartService { get; }
        IReservationService ReservationService { get; }
        ISeatService SeatService { get; }
        ILoanService LoanService { get; }
        IPenaltyService PenaltyService { get; }
        IUserReviewService UserReviewService { get; }
        INotificationService NotificationService { get; }
    }
}
