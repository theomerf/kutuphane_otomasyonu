using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface IBookRepository : IRepositoryBase<Book>
    {
        Task<PagedList<Book>> GetAllBooksAsync(BookRequestParameters p, bool trackChanges);
        Task<Book?> GetOneBookAsync(int id, bool trackChanges);
        void CreateBook(Book book);
        void UpdateBook(Book book);
        void DeleteBook(Book book);

    }
}
