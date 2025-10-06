using Entities.Models;
using Entities.RequestFeatures;
using System.Dynamic;

namespace Repositories.Contracts
{
    public interface IBookRepository : IRepositoryBase<Book>
    {
        Task<(IEnumerable<ExpandoObject> data, int count)> GetAllBooksAsync(BookRequestParameters p, bool trackChanges, CancellationToken ct = default);
        Task<int> GetAllBooksCountAsync();
        Task<IEnumerable<ExpandoObject>> GetRelatedBooksAsync(int id, BookRequestParameters p, bool trackChanges, CancellationToken ct = default);
        Task<Book?> GetOneBookAsync(int id, bool trackChanges);
        Task<Book?> GetOneBookForReviewAsync(int id, bool trackChanges);
        Task<IEnumerable<Book>> GetFavoriteBooksAsync(ICollection<int> ids, bool trackChanges);
        Task DeleteBookImageAsync(int id);
        void CreateBook(Book book);
        void UpdateBook(Book book);
        void DeleteBook(Book book);

    }
}
