using Repositories.Contracts;
using System.Collections;
using System.Collections.Concurrent;
using System.Dynamic;
using System.Reflection;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace Repositories
{
    public class DataShaper<T> : IDataShaper<T> where T : class
    {
        private PropertyInfo[] Properties { get; }

        private static readonly ConcurrentDictionary<string, List<PropertyInfo>> _propertyCache = new();

        public DataShaper()
        {
            Properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
        }

        public async Task<IEnumerable<ExpandoObject>> ShapeQueryAsync(IQueryable<T> query, string? fieldsString, CancellationToken cancellationToken = default)
        {
            var props = GetRequiredProperties(fieldsString).ToList();
            if (props.Count == 0)
                return Enumerable.Empty<ExpandoObject>();

            string projection = BuildProjection(props); 

            var dynamicList = await query
                .Select(projection)          
                .ToDynamicListAsync(cancellationToken)
                .ConfigureAwait(false);

            return ConvertDynamicListToExpando(dynamicList, props);
        }

        public async Task<ExpandoObject?> ShapeSingleAsync(IQueryable<T> query, string? fieldsString, CancellationToken cancellationToken = default)
        {
            var list = await ShapeQueryAsync(query.Take(1), fieldsString, cancellationToken);
            return list.FirstOrDefault();
        }

        private string BuildProjection(List<PropertyInfo> props)
            => $"new ({string.Join(", ", props.Select(p => p.Name))})";

        private IEnumerable<ExpandoObject> ConvertDynamicListToExpando(IList list, List<PropertyInfo> props)
        {
            var shaped = new List<ExpandoObject>(list.Count);
            foreach (var item in list)
                shaped.Add(ConvertDynamicToExpando(item, props));
            return shaped;
        }

        private ExpandoObject ConvertDynamicToExpando(object dynamicItem, List<PropertyInfo> props)
        {
            var exp = new ExpandoObject();
            var dict = (IDictionary<string, object?>)exp;
            var type = dynamicItem.GetType();
            foreach (var p in props)
            {
                var val = type.GetProperty(p.Name)?.GetValue(dynamicItem);
                dict[p.Name] = val;
            }
            return exp;
        }

        private IEnumerable<PropertyInfo> GetRequiredProperties(string? fieldsString)
        {
            string cacheKey = string.IsNullOrWhiteSpace(fieldsString)
                ? "*"
                : string.Join(",",
                    fieldsString
                        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                        .Select(f => f.ToLowerInvariant())
                        .OrderBy(f => f));

            if (_propertyCache.TryGetValue(cacheKey, out var cached))
                return cached;

            List<PropertyInfo> required;
            if (!string.IsNullOrWhiteSpace(fieldsString))
            {
                var fields = fieldsString.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                required = new List<PropertyInfo>(fields.Length);
                foreach (var field in fields)
                {
                    var pi = Properties.FirstOrDefault(p => p.Name.Equals(field, StringComparison.InvariantCultureIgnoreCase));
                    if (pi != null)
                        required.Add(pi);
                }
            }
            else
            {
                required = Properties.ToList();
            }

            _propertyCache[cacheKey] = required;
            return required;
        }
    }
}