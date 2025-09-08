using Entities.Models;
using System.Linq.Expressions;

namespace Repositories.Extensions
{
    public static class RepositoryExtension
    {
        public static IQueryable<T> FilteredBySearchTerm<T>(
            this IQueryable<T> query,
            string searchTerm,
            Expression<Func<T, string>> propertySelector)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return query;

            var loweredTerm = searchTerm.ToLower();
            var parameter = propertySelector.Parameters[0];

            var toLowerCall = Expression.Call(propertySelector.Body, typeof(string).GetMethod("ToLower", Type.EmptyTypes)!);
            var containsCall = Expression.Call(toLowerCall, typeof(string).GetMethod("Contains", new[] { typeof(string) })!, Expression.Constant(loweredTerm));
            var lambda = Expression.Lambda<Func<T, bool>>(containsCall, parameter);

            return query.Where(lambda);
        }

        public static IQueryable<T> ToPaginate<T>(this IQueryable<T> query, int pageSize, int pageNumber)
        {
            if (pageSize <= 0 || pageNumber <= 0)
                return query;

            return query.Skip((pageNumber - 1) * pageSize).Take(pageSize);
        }

        public static IQueryable<T> SortBy<T>(this IQueryable<T> source, string propertyName, bool ascending = true)
        {
            if (string.IsNullOrWhiteSpace(propertyName))
                return source;

            var parameter = Expression.Parameter(typeof(T), "x");
            Expression propertyAccess = parameter;

            foreach (var member in propertyName.Split('.'))
            {
                propertyAccess = Expression.PropertyOrField(propertyAccess, member);
            }

            var converted = Expression.Convert(propertyAccess, typeof(object));
            var lambda = Expression.Lambda<Func<T, object>>(converted, parameter);

            return ascending ? source.OrderBy(lambda) : source.OrderByDescending(lambda);
        }

        public static IQueryable<T> SortExtensionForBooks<T>(this IQueryable<T> query, string parameter)
        {
            if (typeof(T).Name == nameof(Book))
            {
                var bookQuery = query as IQueryable<Book>;

                switch (parameter)
                {
                    case "ID_ASC":
                        return query.SortBy("Id", true);

                    case "ID_DESC":
                        return query.SortBy("Id", false);

                    case "NAME_ASC":
                        return query.SortBy("Title", true);

                    case "NAME_DESC":
                        return query.SortBy("Title", false);

                    case "TOTALCOPIES_ASC":
                        return query.SortBy("TotalCopies", true);

                    case "TOTALCOPIES_DESC":
                        return query.SortBy("TotalCopies", false);

                    case "AVAILABLECOPIES_ASC":
                        return query.SortBy("AvailableCopies", true);

                    case "AVAILABLECOPIES_DESC":
                        return query.SortBy("AvailableCopies", false);

                    case "DATE_ASC":
                        return query.SortBy("PublishedDate", true);

                    case "DATE_DESC":
                        return query.SortBy("PublishedDate", false);

                    default:
                        return query.SortBy("Id", true);
                }
            }

            return query;
        }
    }
}
