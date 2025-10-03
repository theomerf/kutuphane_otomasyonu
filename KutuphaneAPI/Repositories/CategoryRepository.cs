using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class CategoryRepository : RepositoryBase<Category>, ICategoryRepository
    {
        public CategoryRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Category> categories, int count)> GetAllCategoriesAsync(AdminRequestParameters p, bool trackChanges)
        {
            var categoriesQuery = FindAll(trackChanges)
                .Include(c => c.Books)
                .FilterBy(p.SearchTerm, c => c.Name, FilterOperator.Contains)
                .OrderBy(c => c.Id);

            var categories = await categoriesQuery
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            var count = await categoriesQuery.CountAsync();

            return (categories, count);
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesWithoutPaginationAsync(bool trackChanges)
        {
            var categories = await FindAll(trackChanges)
                .Include(c => c.Books)
                .OrderBy(c => c.Id)
                .ToListAsync();

            return categories;
        }

        public async Task<int> GetAllCategoriesCountAsync() => await CountAsync(false);

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
