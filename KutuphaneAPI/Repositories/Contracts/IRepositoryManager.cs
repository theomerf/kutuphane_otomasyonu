namespace Repositories.Contracts
{
    public interface IRepositoryManager
    {
        IBookRepository Book { get; }
        ICategoryRepository Category { get; }
        IAuthorRepository Author { get; }
        ICartRepository Cart { get; }
        IReservationRepository Reservation { get; }
        ISeatRepository Seat { get; }
        void Save();
        Task SaveAsync();
    }
}
