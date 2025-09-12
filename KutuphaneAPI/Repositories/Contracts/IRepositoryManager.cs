namespace Repositories.Contracts
{
    public interface IRepositoryManager
    {
        IBookRepository Book { get; }
        ICategoryRepository Category { get; }
        IAuthorRepository Author { get; }
        ICartRepository Cart { get; }
        void Save();
        Task SaveAsync();
    }
}
