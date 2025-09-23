using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface ITagService
    {
        Task<(IEnumerable<TagDto> tags, MetaData metaData)> GetAllTagsAsync(AdminRequestParameters p, bool trackChanges);
        Task<IEnumerable<TagDto>> GetAllTagsWithoutPaginationAsync(bool trackChanges);
        Task<int> GetAllTagsCountAsync();
        Task<IEnumerable<TagDto>> GetMostPopularTagsAsync(bool trackChanges);
        Task<TagDto> GetOneTagAsync(int id, bool trackChanges);
        Task CreateTagAsync(TagDtoForCreation tagDto);
        Task DeleteTagAsync(int id);
        Task UpdateTagAsync(TagDtoForUpdate tagDto);
    }
}
