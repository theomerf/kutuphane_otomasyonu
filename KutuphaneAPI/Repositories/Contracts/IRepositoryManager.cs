namespace Repositories.Contracts
{
    public interface IRepositoryManager
    {
        IBookRepository Book { get; }
        ICategoryRepository Category { get; }
        IAuthorRepository Author { get; }
        ITagRepository Tag { get; }
        ICartRepository Cart { get; }
        IReservationRepository Reservation { get; }
        ISeatRepository Seat { get; }
        ILoanRepository Loan { get; }
        IPenaltyRepository Penalty { get; }
        void Save();
        Task SaveAsync();
    }
}
