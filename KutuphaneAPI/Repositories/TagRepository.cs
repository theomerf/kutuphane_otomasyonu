using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class TagRepository : RepositoryBase<Tag>, ITagRepository
    {
        public TagRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Tag> tags, int count)> GetAllTagsAsync(AdminRequestParameters p, bool trackChanges)
        {
            var tags = await FindAll(trackChanges)
                .Include(c => c.Books)
                .FilterBy(p.SearchTerm, c => c.Name, FilterOperator.Contains)
                .OrderBy(c => c.Id)
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            var count = await CountAsync(false);

            return (tags, count);
        }

        public async Task<IEnumerable<Tag>> GetAllTagsWithoutPaginationAsync(bool trackChanges)
        {
            var tags = await FindAll(trackChanges)
                .Include(c => c.Books)
                .OrderBy(c => c.Id)
                .ToListAsync();

            return tags;
        }

        public async Task<int> GetAllTagsCountAsync() => await CountAsync(false);

        public async Task<IEnumerable<Tag>> GetMostPopularTagsAsync(bool trackChanges)
        {
            var Tags = await FindAll(trackChanges)
                .Include(c => c.Books)
                .OrderByDescending(c => c.Books!.Count)
                .Take(6)
                .ToListAsync();

            return Tags;
        }

        public async Task<Tag?> GetOneTagAsync(int id, bool trackChanges)
        {
            var tag = await FindByCondition(c => c.Id == id, trackChanges)
                .FirstOrDefaultAsync();

            return tag;
        }
        public void CreateTag(Tag tag)
        {
            Create(tag);
        }

        public void DeleteTag(Tag tag)
        {
            Remove(tag);
        }

        public void UpdateTag(Tag tag)
        {
            Update(tag);
        }
    }
}
