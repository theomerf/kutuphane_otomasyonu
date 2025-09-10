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
        private readonly IBookDataShaper _bookShaper;
        public BookRepository(RepositoryContext context, IBookDataShaper bookShaper) : base(context)
        {
            _bookShaper = bookShaper;
        }

        public async Task<(IEnumerable<ExpandoObject> data, int count)> GetAllBooksAsync(BookRequestParameters p, bool trackChanges, CancellationToken ct = default)
        {
            var query = FindAll(trackChanges)
                .FilterBy(p.SearchTerm, b => b.Title!, FilterOperator.Contains)
                .FilterBy(p.IsAvailable, b => b.AvailableCopies > 0 ? true : false)
                .FilterBy(p.IsPopular, b => b.AvailableCopies < 5 ? true : false)
                .FilterByCategory(p.CategoryId)
                .FilterByAuthor(p.AuthorId);

            var count = await query.CountAsync(ct);

            query = query.SortExtensionForBooks(p.OrderBy ?? "")
                .ToPaginate(p.PageSize, p.PageNumber);

            var shaped = await _bookShaper.ShapeAsync(query, p.Fields,p, ct);

            return (shaped, count);
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
