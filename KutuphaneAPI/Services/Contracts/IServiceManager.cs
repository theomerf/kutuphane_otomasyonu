namespace Services.Contracts
{
    public interface IServiceManager
    {
        IAccountService AccountService { get; }
        IBookService BookService { get; }
        ICategoryService CategoryService { get; }
        IAuthorService AuthorService { get; }
        ICartService CartService { get; }
        IReservationService ReservationService { get; }
        ISeatService SeatService { get; }
    }
}
