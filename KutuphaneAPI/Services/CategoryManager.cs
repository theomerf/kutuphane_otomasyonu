using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Repositories.Contracts;
using Services.Contracts;
using System.Dynamic;
using static System.Reflection.Metadata.BlobBuilder;

namespace Services
{
    public class CategoryManager : ICategoryService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public CategoryManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }
        public async Task<(IEnumerable<CategoryDto> categories, MetaData metaData)> GetAllCategoriesAsync(CategoryRequestParameters p, bool trackChanges)
        {
            var categories = await _manager.Category.GetAllCategoriesAsync(p, trackChanges);
            var categoriesDto = _mapper.Map<IEnumerable<CategoryDto>>(categories.categories);

            var pagedCategories = PagedList<CategoryDto>.ToPagedList(categoriesDto, p.PageNumber, p.PageSize, categories.count);

            return (pagedCategories, pagedCategories.MetaData);
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesWithoutPaginationAsync(bool trackChanges)
        {
            var categories = await _manager.Category.GetAllCategoriesWithoutPaginationAsync(trackChanges);
            var categoriesDto = _mapper.Map<IEnumerable<CategoryDto>>(categories);

            return categoriesDto;
        }

        public async Task<int> GetAllCategoriesCountAsync() => await _manager.Category.CountAsync(false);

        public async Task<IEnumerable<CategoryDto>> GetMostPopularCategoriesAsync(bool trackChanges)
        {
            var categories = await _manager.Category.GetMostPopularCategoriesAsync(trackChanges);
            var categoriesDto = _mapper.Map<IEnumerable<CategoryDto>>(categories);

            return categoriesDto;
        }

        public async Task<CategoryDto> GetOneCategoryAsync(int id, bool trackChanges)
        {
            var category = await GetOneCategoryForServiceAsync(id, trackChanges);
            var categoryDto = _mapper.Map<CategoryDto>(category);

            return categoryDto;
        }

        public async Task<Category> GetOneCategoryForServiceAsync(int id, bool trackChanges)
        {
            var category = await _manager.Category.GetOneCategoryAsync(id, trackChanges);
            if(category == null)
            {
                throw new CategoryNotFoundException(id);
            }

            return category;
        }

        public async Task CreateCategoryAsync(CategoryDtoForCreation categoryDto)
        {
            var category = _mapper.Map<Category>(categoryDto);
            
            _manager.Category.CreateCategory(category);
            await _manager.SaveAsync();
        }

        public async Task DeleteCategoryAsync(int id)
        {
            var category = await GetOneCategoryForServiceAsync(id, false);

            _manager.Category.DeleteCategory(category);
            await _manager.SaveAsync();
        }

        public async Task UpdateCategoryAsync(CategoryDtoForUpdate categoryDto)
        {
            var category = await GetOneCategoryForServiceAsync(categoryDto.Id, true);

            _mapper.Map(categoryDto, category);
            _manager.Category.UpdateCategory(category);
            await _manager.SaveAsync();
        }
    }
}
