using Entities.Dtos;
using Entities.RequestFeatures;
using System.Dynamic;

namespace Services.Contracts
{
    public interface IBookService
    {
        Task<(IEnumerable<ExpandoObject> books, MetaData metaData)> GetAllBooksAsync(BookRequestParameters p, bool trackChanges);
        Task<IEnumerable<ExpandoObject>> GetRelatedBooksAsync(int id, BookRequestParameters p, bool trackChanges);
        Task<BookDto?> GetOneBookAsync(int id, bool trackChanges);
        Task CreateBookAsync(BookDto bookDto);
        Task UpdateBookAsync(BookDto bookDto);
        Task DeleteBookAsync(int id);
    }
}
