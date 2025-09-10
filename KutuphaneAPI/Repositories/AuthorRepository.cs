using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class AuthorRepository : RepositoryBase<Author>, IAuthorRepository
    {
        public AuthorRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Author>> GetAllAuthorsAsync(bool trackChanges)
        {
            var authors = await FindAll(trackChanges)
                .Include(c => c.Books)
                .ToListAsync();

            return authors;
        }

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
