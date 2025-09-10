using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class CategoryRepository : RepositoryBase<Category>, ICategoryRepository
    {
        public CategoryRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync(bool trackChanges)
        {
            var categories = await FindAll(trackChanges)
                .Include(c => c.Books)
                .ToListAsync();

            return categories;
        }

        public async Task<IEnumerable<Category>> GetMostPopularCategoriesAsync(bool trackChanges)
        {
            var categories = await FindAll(trackChanges)
                .Include(c => c.Books)
                .OrderByDescending(c => c.Books!.Count)
                .Take(6)
                .ToListAsync();

            return categories;
        }

        public async Task<Category?> GetOneCategoryAsync(int id, bool trackChanges)
        {
            var category = await FindByCondition(c => c.Id == id, trackChanges)
                .FirstOrDefaultAsync();

            return category;
        }
        public void CreateCategory(Category category)
        {
            Create(category);
        }

        public void DeleteCategory(Category category)
        {
            Remove(category);
        }

        public void UpdateCategory(Category category)
        {
            Update(category);
        }
    }
}
