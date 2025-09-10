using Entities.Dtos;

namespace Services.Contracts
{
    public interface IAuthorService
    {
        Task<IEnumerable<AuthorDto>> GetAllAuthorsAsync(bool trackChanges);
        Task<IEnumerable<AuthorDto>> GetMostPopularAuthorsAsync(bool trackChanges);
        Task<AuthorDto> GetOneAuthorAsync(int id, bool trackChanges);
        Task CreateAuthorAsync(AuthorDto author);
        Task DeleteAuthorAsync(int id);
        Task UpdateAuthorAsync(AuthorDto author);
    }
}
