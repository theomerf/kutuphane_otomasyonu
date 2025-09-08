using Entities.Models;
using Entities.RequestFeatures;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Contracts
{
    public interface IBookDataShaper
    {
        Task<IEnumerable<ExpandoObject>> ShapeAsync(
            IQueryable<Book> query,
            string? fields,
            CancellationToken ct = default);
    }
}
