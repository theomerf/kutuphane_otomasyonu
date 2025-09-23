using Entities.Dtos;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface IAuthorService
    {
        Task<(IEnumerable<AuthorDto> authors, MetaData metaData)> GetAllAuthorsAsync(AdminRequestParameters p, bool trackChanges);
        Task<IEnumerable<AuthorDto>> GetAllAuthorsWithoutPaginationAsync(bool trackChanges);
        Task<int> GetAllAuthorsCountAsync();
        Task<IEnumerable<AuthorDto>> GetMostPopularAuthorsAsync(bool trackChanges);
        Task<AuthorDto> GetOneAuthorAsync(int id, bool trackChanges);
        Task CreateAuthorAsync(AuthorDtoForCreation author);
        Task DeleteAuthorAsync(int id);
        Task UpdateAuthorAsync(AuthorDtoForUpdate author);
    }
}
