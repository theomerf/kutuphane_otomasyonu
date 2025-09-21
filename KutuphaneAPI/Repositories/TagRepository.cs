using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class TagRepository : RepositoryBase<Tag>, ITagRepository
    {
        public TagRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Tag>> GetAllTagsAsync(bool trackChanges)
        {
            var Tags = await FindAll(trackChanges)
                .Include(c => c.Books)
                .ToListAsync();

            return Tags;
        }

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
