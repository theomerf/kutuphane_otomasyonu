using Entities.Models;

namespace Repositories.Contracts
{
    public interface ITagRepository : IRepositoryBase<Tag>
    {
        Task<IEnumerable<Tag>> GetAllTagsAsync(bool trackChanges);
        Task<int> GetAllTagsCountAsync();
        Task<IEnumerable<Tag>> GetMostPopularTagsAsync(bool trackChanges);
        Task<Tag?> GetOneTagAsync(int id, bool trackChanges);
        void CreateTag(Tag category);
        void DeleteTag(Tag category);
        void UpdateTag(Tag category);
    }
}
