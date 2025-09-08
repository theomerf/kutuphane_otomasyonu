using System.Dynamic;

namespace Repositories.Contracts
{
    public interface IDataShaper<T> where T : class
    {
        Task<IEnumerable<ExpandoObject>> ShapeQueryAsync(IQueryable<T> query, string? fieldsString, CancellationToken cancellationToken = default);
        Task<ExpandoObject?> ShapeSingleAsync(IQueryable<T> query, string? fieldsString, CancellationToken cancellationToken = default);
    }
}
