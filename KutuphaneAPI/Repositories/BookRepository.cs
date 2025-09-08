using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;
using System.Dynamic;

namespace Repositories
{
    public class BookRepository : RepositoryBase<Book>, IBookRepository
    {
        private readonly IDataShaper<Book> _dataShaper;
        public BookRepository(RepositoryContext context, IDataShaper<Book> dataShaper) : base(context)
        {
            _dataShaper = dataShaper;
        }

        public async Task<IEnumerable<ExpandoObject>> GetAllBooksAsync(BookRequestParameters p, bool trackChanges, CancellationToken ct = default)
        {
            var books = FindAll(trackChanges)
                .FilteredBySearchTerm(p.SearchTerm ?? "", b => b.Title!)
                .Include(b => b.Authors)
                .Include(b => b.Categories)
                .Include(b => b.Images)
                .Include(b => b.Tags)
                .SortExtensionForBooks(p.OrderBy ?? "")
                .ToPaginate(p.PageSize, p.PageNumber);

            var shaped = await _dataShaper.ShapeQueryAsync(books, p.Fields, ct);

            return shaped;
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
