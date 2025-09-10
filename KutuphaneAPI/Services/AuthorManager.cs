using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class AuthorManager : IAuthorService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public AuthorManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }
        public async Task<IEnumerable<AuthorDto>> GetAllAuthorsAsync(bool trackChanges)
        {
            var authors = await _manager.Author.GetAllAuthorsAsync(trackChanges);
            var authorsDto = _mapper.Map<IEnumerable<AuthorDto>>(authors);

            return authorsDto;
        }

        public async Task<IEnumerable<AuthorDto>> GetMostPopularAuthorsAsync(bool trackChanges)
        {
            var authors = await _manager.Author.GetMostPopularAuthorsAsync(trackChanges);
            var authorsDto = _mapper.Map<IEnumerable<AuthorDto>>(authors);

            return authorsDto;
        }

        public async Task<AuthorDto> GetOneAuthorAsync(int id, bool trackChanges)
        {
            var author = await GetOneAuthorForServiceAsync(id, trackChanges);
            var authorDto = _mapper.Map<AuthorDto>(author);

            return authorDto;
        }

        public async Task<Author> GetOneAuthorForServiceAsync(int id, bool trackChanges)
        {
            var author = await _manager.Author.GetOneAuthorAsync(id, trackChanges);
            if (author == null)
            {
                throw new AuthorNotFoundException(id);
            }

            return author;
        }

        public async Task CreateAuthorAsync(AuthorDto authorDto)
        {
            var author = _mapper.Map<Author>(authorDto);

            _manager.Author.CreateAuthor(author);
            await _manager.SaveAsync();
        }

        public async Task DeleteAuthorAsync(int id)
        {
            var author = await GetOneAuthorForServiceAsync(id, false);

            _manager.Author.DeleteAuthor(author);
            await _manager.SaveAsync();
        }

        public async Task UpdateAuthorAsync(AuthorDto authorDto)
        {
            var author = await GetOneAuthorForServiceAsync(authorDto.Id, true);

            _mapper.Map(authorDto, author);
            _manager.Author.UpdateAuthor(author);
            await _manager.SaveAsync();
        }
    }
}
