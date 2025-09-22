using Entities.Models;

namespace Repositories.Contracts
{
    public interface IAuthorRepository : IRepositoryBase<Author>
    {
        Task<IEnumerable<Author>> GetAllAuthorsAsync(bool trackChanges);
        Task<int> GetAllAuthorsCountAsync();
        Task<IEnumerable<Author>> GetMostPopularAuthorsAsync(bool trackChanges);
        Task<Author?> GetOneAuthorAsync(int id, bool trackChanges);
        void CreateAuthor(Author author);
        void DeleteAuthor(Author author);
        void UpdateAuthor(Author author);
    }
}
