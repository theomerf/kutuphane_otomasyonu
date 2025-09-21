using Entities.Dtos;
using Entities.Models;

namespace Services.Contracts
{
    public interface ITagService
    {
        Task<IEnumerable<TagDto>> GetAllTagsAsync(bool trackChanges);
        Task<IEnumerable<TagDto>> GetMostPopularTagsAsync(bool trackChanges);
        Task<TagDto> GetOneTagAsync(int id, bool trackChanges);
        Task CreateTagAsync(TagDto tagDto);
        Task DeleteTagAsync(int id);
        Task UpdateTagAsync(TagDto tagDto);
    }
}
