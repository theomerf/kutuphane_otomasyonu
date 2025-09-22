using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface ICategoryRepository : IRepositoryBase<Category>
    {
        Task<(IEnumerable<Category> categories, int count)> GetAllCategoriesAsync(CategoryRequestParameters p, bool trackChanges);
        Task<IEnumerable<Category>> GetAllCategoriesWithoutPaginationAsync(bool trackChanges);
        Task<int> GetAllCategoriesCountAsync();
        Task<IEnumerable<Category>> GetMostPopularCategoriesAsync(bool trackChanges);
        Task<Category?> GetOneCategoryAsync(int id, bool trackChanges);
        void CreateCategory(Category category);
        void DeleteCategory(Category category);
        void UpdateCategory(Category category);
    }
}
