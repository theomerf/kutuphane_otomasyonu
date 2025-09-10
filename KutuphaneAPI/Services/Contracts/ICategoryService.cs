using Entities.Dtos;

namespace Services.Contracts
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync(bool trackChanges);
        Task<IEnumerable<CategoryDto>> GetMostPopularCategoriesAsync(bool trackChanges);
        Task<CategoryDto> GetOneCategoryAsync(int id, bool trackChanges);
        Task CreateCategoryAsync(CategoryDto category);
        Task DeleteCategoryAsync(int id);
        Task UpdateCategoryAsync(CategoryDto category);
    }
}
