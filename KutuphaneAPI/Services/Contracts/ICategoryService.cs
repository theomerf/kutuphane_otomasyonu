using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface ICategoryService
    {
        Task<(IEnumerable<CategoryDto> categories, MetaData metaData)> GetAllCategoriesAsync(AdminRequestParameters p, bool trackChanges);
        Task<IEnumerable<CategoryDto>> GetAllCategoriesWithoutPaginationAsync(bool trackChanges);
        Task<int> GetAllCategoriesCountAsync();
        Task<IEnumerable<CategoryDto>> GetMostPopularCategoriesAsync(bool trackChanges);
        Task<CategoryDto> GetOneCategoryAsync(int id, bool trackChanges);
        Task CreateCategoryAsync(CategoryDtoForCreation categoryDto);
        Task DeleteCategoryAsync(int id);
        Task UpdateCategoryAsync(CategoryDtoForUpdate categoryDto);
    }
}
