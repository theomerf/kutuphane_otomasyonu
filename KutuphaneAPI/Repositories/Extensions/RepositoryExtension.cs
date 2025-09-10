using Entities.Models;
using System.Linq.Expressions;

public enum FilterOperator
{
    Equal,
    NotEqual,
    GreaterThan,
    LessThan,
    Contains,
    StartsWith,
    EndsWith
}

namespace Repositories.Extensions
{
    public static class RepositoryExtension
    {
        public static IQueryable<T> FilterBy<T, TProperty>(
            this IQueryable<T> query,
            TProperty? value,
            Expression<Func<T, TProperty>> propertySelector,
            FilterOperator op = FilterOperator.Equal)
        {
            if (value == null || value.Equals(default(TProperty)))
                return query;

            var parameter = propertySelector.Parameters[0];
            var member = propertySelector.Body;
            var constant = Expression.Constant(value, typeof(TProperty));

            Expression body = op switch
            {
                FilterOperator.Equal => Expression.Equal(member, constant),
                FilterOperator.NotEqual => Expression.NotEqual(member, constant),
                FilterOperator.GreaterThan => Expression.GreaterThan(member, constant),
                FilterOperator.LessThan => Expression.LessThan(member, constant),
                FilterOperator.Contains => Expression.Call(
                    member,
                    typeof(string).GetMethod("Contains", new[] { typeof(string) })!,
                    Expression.Constant(value.ToString()!, typeof(string))
                ),
                FilterOperator.StartsWith => Expression.Call(
                    member,
                    typeof(string).GetMethod("StartsWith", new[] { typeof(string) })!,
                    Expression.Constant(value.ToString()!, typeof(string))
                ),
                FilterOperator.EndsWith => Expression.Call(
                    member,
                    typeof(string).GetMethod("EndsWith", new[] { typeof(string) })!,
                    Expression.Constant(value.ToString()!, typeof(string))
                ),
                _ => throw new NotImplementedException()
            };

            var lambda = Expression.Lambda<Func<T, bool>>(body, parameter);

            return query.Where(lambda);
        }

        public static IQueryable<Book> FilterByCategory(this IQueryable<Book> query, int? categoryId)
        {
            if (categoryId.HasValue && categoryId.Value > 0)
            {
                return query.Where(b => b.Categories!.Any(c => c.Id == categoryId.Value));
            }
            return query;
        }

        public static IQueryable<Book> FilterByAuthor(this IQueryable<Book> query, int? authorId)
        {
            if (authorId.HasValue && authorId.Value > 0)
            {
                return query.Where(b => b.Authors!.Any(a => a.Id == authorId.Value));
            }
            return query;
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
