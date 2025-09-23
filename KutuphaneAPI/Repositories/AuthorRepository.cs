using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class AuthorRepository : RepositoryBase<Author>, IAuthorRepository
    {
        public AuthorRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Author> authors, int count)> GetAllAuthorsAsync(AdminRequestParameters p, bool trackChanges)
        {
            var authors = await FindAll(trackChanges)
                .Include(c => c.Books)
                .FilterBy(p.SearchTerm, c => c.Name, FilterOperator.Contains)
                .OrderBy(c => c.Id)
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            var count = await CountAsync(false);

            return (authors, count);
        }

        public async Task<IEnumerable<Author>> GetAllAuthorsWithoutPaginationAsync(bool trackChanges)
        {
            var authors = await FindAll(trackChanges)
                .Include(c => c.Books)
                .OrderBy(c => c.Id)
                .ToListAsync();

            return authors;
        }

        public async Task<int> GetAllAuthorsCountAsync() => await CountAsync(false);

        public async Task<IEnumerable<Author>> GetMostPopularAuthorsAsync(bool trackChanges)
        {
            var authors = await FindAll(trackChanges)
                .Include(c => c.Books)
                .OrderByDescending(c => c.Books!.Count)
                .Take(6)
                .ToListAsync();

            return authors;
        }

        public async Task<Author?> GetOneAuthorAsync(int id, bool trackChanges)
        {
            var author = await FindByCondition(c => c.Id == id, trackChanges)
                .FirstOrDefaultAsync();

            return author;
        }

        public void CreateAuthor(Author author)
        {
            Create(author);
        }

        public void DeleteAuthor(Author author)
        {
            Remove(author);
        }

        public void UpdateAuthor(Author author)
        {
            Update(author);
        }
    }
}
