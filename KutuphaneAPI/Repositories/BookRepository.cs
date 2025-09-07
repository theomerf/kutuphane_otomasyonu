using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class BookRepository : RepositoryBase<Book>, IBookRepository
    {
        public BookRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<PagedList<Book>> GetAllBooksAsync(BookRequestParameters p, bool trackChanges)
        {
            var books = await FindAll(trackChanges)
                .FilteredBySearchTerm(p.SearchTerm ?? "", b => b.Title!)
                .SortExtensionForBooks(p.OrderBy ?? "")
                .ToListAsync();

            return PagedList<Book>.ToPagedList(books, p.PageNumber, p.PageSize);
        }

        public async Task<Book?> GetOneBookAsync(int id, bool trackChanges)
        {
            var books = await FindByCondition(b => b.Id == id, trackChanges)
                .FirstOrDefaultAsync();

            return books;
        }

        public void CreateBook(Book book)
        {
            Create(book);
        }

        public void DeleteBook(Book book)
        {
            Remove(book);
        }

        public void UpdateBook(Book book)
        {
            Update(book);
        }
    }
}
