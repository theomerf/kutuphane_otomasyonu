namespace Repositories.Contracts
{
    public interface IRepositoryManager
    {
        IBookRepository Book { get; }
        ICategoryRepository Category { get; }
        IAuthorRepository Author { get; }
        void Save();
        Task SaveAsync();
    }
}
