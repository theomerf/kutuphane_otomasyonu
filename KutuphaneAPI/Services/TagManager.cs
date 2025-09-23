using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Repositories.Contracts;
using Services.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class TagManager : ITagService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public TagManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }

        public async Task<(IEnumerable<TagDto> tags, MetaData metaData)> GetAllTagsAsync(AdminRequestParameters p, bool trackChanges)
        {
            var tags = await _manager.Tag.GetAllTagsAsync(p, trackChanges);
            var tagsDto = _mapper.Map<IEnumerable<TagDto>>(tags.tags);

            var pagedTags = PagedList<TagDto>.ToPagedList(tagsDto, p.PageNumber, p.PageSize, tags.count);

            return (pagedTags, pagedTags.MetaData);
        }

        public async Task<IEnumerable<TagDto>> GetAllTagsWithoutPaginationAsync(bool trackChanges)
        {
            var tags = await _manager.Tag.GetAllTagsWithoutPaginationAsync(trackChanges);
            var tagsDto = _mapper.Map<IEnumerable<TagDto>>(tags);

            return tagsDto;
        }

        public async Task<int> GetAllTagsCountAsync() => await _manager.Tag.GetAllTagsCountAsync();

        public async Task<IEnumerable<TagDto>> GetMostPopularTagsAsync(bool trackChanges)
        {
            var tags = await _manager.Tag.GetMostPopularTagsAsync(trackChanges);
            var tagsDto = _mapper.Map<IEnumerable<TagDto>>(tags);

            return tagsDto;
        }

        public async Task<TagDto> GetOneTagAsync(int id, bool trackChanges)
        {
            var tag = await GetOneTagForServiceAsync(id, trackChanges);
            var tagDto = _mapper.Map<TagDto>(tag);

            return tagDto;
        }

        public async Task<Tag> GetOneTagForServiceAsync(int id, bool trackChanges)
        {
            var tag = await _manager.Tag.GetOneTagAsync(id, trackChanges);
            if (tag == null)
            {
                throw new TagNotFoundException(id);
            }

            return tag;
        }

        public async Task CreateTagAsync(TagDtoForCreation tagDto)
        {
            var tag = _mapper.Map<Tag>(tagDto);

            _manager.Tag.CreateTag(tag);
            await _manager.SaveAsync();
        }

        public async Task DeleteTagAsync(int id)
        {
            var tag = await GetOneTagForServiceAsync(id, false);

            _manager.Tag.DeleteTag(tag);
            await _manager.SaveAsync();
        }

        public async Task UpdateTagAsync(TagDtoForUpdate tagDto)
        {
            var tag = await GetOneTagForServiceAsync(tagDto.Id, true);

            _mapper.Map(tagDto, tag);
            _manager.Tag.UpdateTag(tag);
            await _manager.SaveAsync();
        }
    }
}
