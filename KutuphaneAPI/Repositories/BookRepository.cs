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

        public async Task<int> GetAllBooksCountAsync() => await FindAll(false).CountAsync();

        public async Task<IEnumerable<ExpandoObject>> GetRelatedBooksAsync(int id, BookRequestParameters p, bool trackChanges, CancellationToken ct = default)
        {
            var query = FindAll(trackChanges)
                .Where(b => b.Id != id)
                .Where(b => b.Tags!.Any(tag => p.TagIds!.Any(t => t == tag.Id)))
                .Where(b => b.Categories!.Any(cat => p.CategoryIds!.Any(c => c == cat.Id)));

            query = query.SortExtensionForBooks(p.OrderBy ?? "")
                .ToPaginate(p.PageSize, p.PageNumber);

            var shaped = await _bookShaper.ShapeAsync(query, p.Fields, p, ct);

            return shaped;
        }

        public async Task<Book?> GetOneBookAsync(int id, bool trackChanges)
        {
            var books = await FindByCondition(b => b.Id == id, trackChanges)
                .Include(b => b.Categories)
                .Include(b => b.Authors)
                .Include(b => b.Tags)
                .Include(b => b.Images)
                .AsSplitQuery()
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
