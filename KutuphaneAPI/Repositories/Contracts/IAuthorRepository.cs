using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface IAuthorRepository : IRepositoryBase<Author>
    {
        Task<(IEnumerable<Author> authors, int count)> GetAllAuthorsAsync(AdminRequestParameters p, bool trackChanges);
        Task<IEnumerable<Author>> GetAllAuthorsWithoutPaginationAsync(bool trackChanges);
        Task<int> GetAllAuthorsCountAsync();
        Task<IEnumerable<Author>> GetMostPopularAuthorsAsync(bool trackChanges);
        Task<Author?> GetOneAuthorAsync(int id, bool trackChanges);
        void CreateAuthor(Author author);
        void DeleteAuthor(Author author);
        void UpdateAuthor(Author author);
    }
}
