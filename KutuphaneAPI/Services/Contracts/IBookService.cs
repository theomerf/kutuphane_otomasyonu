using Entities.Dtos;
using Entities.RequestFeatures;
using System.Dynamic;

namespace Services.Contracts
{
    public interface IBookService
    {
        Task<(IEnumerable<ExpandoObject> books, MetaData metaData)> GetAllBooksAsync(BookRequestParameters p, bool trackChanges);
        Task<int> GetAllBooksCountAsync();
        Task<IEnumerable<ExpandoObject>> GetRelatedBooksAsync(int id, BookRequestParameters p, bool trackChanges);
        Task<BookDto?> GetOneBookAsync(int id, bool trackChanges);
        Task<IEnumerable<BookDto>> GetFavoriteBooksAsync(ICollection<int> ids, bool trackChanges);
        Task CreateBookAsync(BookDtoForCreation bookDto, List<string> newFilePaths);
        Task UpdateBookAsync(BookDtoForUpdate bookDto, List<string> newFilePaths);
        Task DeleteBookAsync(int id);
    }
}
