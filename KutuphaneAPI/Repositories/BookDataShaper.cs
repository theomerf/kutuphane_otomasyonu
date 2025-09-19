using System.Dynamic;
using System.Reflection;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class BookDataShaper : IBookDataShaper
    {
        private const string DEFAULT_PROFILE = "Id,Title,AvailableCopies,Images.Id,Images.ImageUrl,Tags.Id,Tags.Name,Authors.Id,Authors.Name,Categories.Id,Categories.Name";

        private static readonly HashSet<string> _scalarFields = new(StringComparer.InvariantCultureIgnoreCase)
        {
            "Id","ISBN","Title","TotalCopies","AvailableCopies","Location","PublishedDate","Summary"
        };

        private static readonly Dictionary<string, HashSet<string>> _collectionFieldMap =
            new(StringComparer.InvariantCultureIgnoreCase)
            {
                { "Images", new HashSet<string>(["Id","ImageUrl","IsPrimary","Caption","BookId"], StringComparer.InvariantCultureIgnoreCase) },
                { "Tags", new HashSet<string>(["Id","Name"], StringComparer.InvariantCultureIgnoreCase) },
                { "Authors", new HashSet<string>(["Id","Name"], StringComparer.InvariantCultureIgnoreCase) },
                { "Categories", new HashSet<string>(["Id","Name","ParentId"], StringComparer.InvariantCultureIgnoreCase) }
            };

        private static readonly Dictionary<string, string[]> _collectionDefaultSubFields =
            new(StringComparer.InvariantCultureIgnoreCase)
            {
                { "Images", new [] { "ImageUrl" } },
                { "Tags", new [] { "Name" } },
                { "Authors", new [] { "Name" } },
                { "Categories", new [] { "Name" } }
            };

        public async Task<IEnumerable<ExpandoObject>> ShapeAsync(
            IQueryable<Book> query,
            string? fields,
            BookRequestParameters? parameters = null,
            CancellationToken ct = default)
        {
            var parseResult = ParseFields(fields);
            var totalIncluded = 0;

            if (parameters != null)
            {
                if (parameters.CategoryId.HasValue && parameters.CategoryId.Value > 0)
                    parseResult.IncludeCategories = true;

                if (parameters.AuthorId.HasValue && parameters.AuthorId.Value > 0)
                    parseResult.IncludeAuthors = true;
            }

            var projectedQuery = query.Select(b => new
            {
                Scalars = new
                {
                    b.Id,
                    b.ISBN,
                    b.Title,
                    b.TotalCopies,
                    b.AvailableCopies,
                    b.Location,
                    b.PublishedDate,
                    b.Summary
                },
                Images = parseResult.IncludeImages
                    ? b.Images!.Select(i => new
                    {
                        i.Id,
                        i.ImageUrl,
                        i.IsPrimary,
                        i.Caption,
                        i.BookId
                    })
                    : null,
                Tags = parseResult.IncludeTags
                    ? b.Tags!.Select(t => new
                    {
                        t.Id,
                        t.Name
                    })
                    : null,
                Authors = parseResult.IncludeAuthors
                    ? b.Authors!.Select(a => new
                    {
                        a.Id,
                        a.Name
                    })
                    : null,
                Categories = parseResult.IncludeCategories
                    ? b.Categories!.Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.ParentId
                    })
                    : null
            });

            totalIncluded = (parseResult.IncludeImages ? 1 : 0)
                + (parseResult.IncludeTags ? 1 : 0)
                + (parseResult.IncludeAuthors ? 1 : 0)
                + (parseResult.IncludeCategories ? 1 : 0);

            if (totalIncluded > 1)
                projectedQuery = projectedQuery.AsSplitQuery();

            var materialized = await projectedQuery.ToListAsync(ct);

            var shaped = new List<ExpandoObject>(materialized.Count);

            foreach (var row in materialized)
            {
                dynamic exp = new ExpandoObject();
                var dict = (IDictionary<string, object?>)exp;

                var scalarType = row.Scalars.GetType();
                var scalarProps = scalarType.GetProperties(BindingFlags.Public | BindingFlags.Instance);

                IEnumerable<string> scalarNamesToTake = parseResult.AllRequested
                    ? scalarProps.Select(p => p.Name)
                    : parseResult.ScalarSelections;

                foreach (var scalarName in scalarNamesToTake)
                {
                    var pi = scalarProps.FirstOrDefault(p =>
                        p.Name.Equals(scalarName, StringComparison.InvariantCultureIgnoreCase));
                    if (pi != null)
                    {
                        var camelCaseName = char.ToLowerInvariant(pi.Name[0]) + pi.Name.Substring(1);
                        dict[camelCaseName] = pi.GetValue(row.Scalars);
                    }
                }

                if (parseResult.IncludeImages)
                {
                    dict["images"] = ShapeCollection(row.Images, parseResult.AllRequested
                        ? _collectionFieldMap["Images"]
                        : parseResult.CollectionSelections.GetValueOrDefault("Images")!);
                }
                if (parseResult.IncludeTags)
                {
                    dict["tags"] = ShapeCollection(row.Tags, parseResult.AllRequested
                        ? _collectionFieldMap["Tags"]
                        : parseResult.CollectionSelections.GetValueOrDefault("Tags")!);
                }
                if (parseResult.IncludeAuthors)
                {
                    dict["authors"] = ShapeCollection(row.Authors, parseResult.AllRequested
                        ? _collectionFieldMap["Authors"]
                        : parseResult.CollectionSelections.GetValueOrDefault("Authors")!);
                }
                if (parseResult.IncludeCategories)
                {
                    dict["categories"] = ShapeCollection(row.Categories, parseResult.AllRequested
                        ? _collectionFieldMap["Categories"]
                        : parseResult.CollectionSelections.GetValueOrDefault("Categories")!);
                }

                shaped.Add(exp);
            }

            return (shaped);
        }

        private List<ExpandoObject> ShapeCollection(IEnumerable<object>? source, IEnumerable<string> wantedFields)
        {
            if (source == null) return new List<ExpandoObject>();

            var list = new List<ExpandoObject>();
            foreach (var item in source)
            {
                dynamic colExp = new ExpandoObject();
                var colDict = (IDictionary<string, object?>)colExp;

                var type = item.GetType();
                foreach (var field in wantedFields)
                {
                    var pi = type.GetProperty(field, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                    if (pi != null)
                    {
                        var camelCaseName = char.ToLowerInvariant(pi.Name[0]) + pi.Name.Substring(1);
                        colDict[camelCaseName] = pi.GetValue(item);
                    }
                }
                list.Add(colExp);
            }
            return list;
        }

        private ParsedFields ParseFields(string? fieldsRaw)
        {
            var result = new ParsedFields();

            if (string.IsNullOrWhiteSpace(fieldsRaw))
            {
                fieldsRaw = DEFAULT_PROFILE;
            }

            if (IsAll(fieldsRaw))
            {
                result.AllRequested = true;
                result.ScalarSelections = new HashSet<string>(_scalarFields, StringComparer.InvariantCultureIgnoreCase);
                foreach (var kvp in _collectionFieldMap)
                {
                    result.CollectionSelections[kvp.Key] = new HashSet<string>(kvp.Value, StringComparer.InvariantCultureIgnoreCase);
                }
                result.IncludeImages = result.IncludeAuthors = result.IncludeCategories = result.IncludeTags = true;
                return result;
            }

            var tokens = fieldsRaw
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            var invalids = new List<string>();

            foreach (var token in tokens)
            {
                var parts = token.Split('.', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

                if (parts.Length == 1)
                {
                    var single = parts[0];

                    if (_scalarFields.Contains(single))
                    {
                        result.ScalarSelections.Add(single);
                        continue;
                    }

                    if (_collectionFieldMap.ContainsKey(single))
                    {
                        result.CollectionSelections[single] = new HashSet<string>(_collectionDefaultSubFields[single], StringComparer.InvariantCultureIgnoreCase);
                        MarkInclude(result, single);
                        continue;
                    }

                    invalids.Add(single);
                }
                else if (parts.Length == 2)
                {
                    var root = parts[0];
                    var sub = parts[1];

                    if (_collectionFieldMap.ContainsKey(root))
                    {
                        if (_collectionFieldMap[root].Contains(sub))
                        {
                            if (!result.CollectionSelections.ContainsKey(root))
                                result.CollectionSelections[root] = new HashSet<string>(StringComparer.InvariantCultureIgnoreCase);

                            result.CollectionSelections[root].Add(sub);
                            MarkInclude(result, root);
                        }
                        else
                        {
                            invalids.Add(token);
                        }
                    }
                    else
                    {
                        invalids.Add(token);
                    }
                }
                else
                {
                    invalids.Add(token);
                }
            }

            if (invalids.Count > 0)
                throw new InvalidFieldsBadRequestException(invalids);

            if (result.ScalarSelections.Count == 0)
            {
                var defaultTokens = DEFAULT_PROFILE.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
                foreach (var d in defaultTokens)
                {
                    if (!d.Contains('.') && _scalarFields.Contains(d))
                        result.ScalarSelections.Add(d);
                }
            }

            return result;
        }

        private bool IsAll(string fieldsRaw)
        {
            var trimmed = fieldsRaw.Trim();
            return trimmed.Equals("all", StringComparison.InvariantCultureIgnoreCase) || trimmed == "*";
        }

        private void MarkInclude(ParsedFields result, string collectionName)
        {
            switch (collectionName.ToLowerInvariant())
            {
                case "images": result.IncludeImages = true; break;
                case "tags": result.IncludeTags = true; break;
                case "authors": result.IncludeAuthors = true; break;
                case "categories": result.IncludeCategories = true; break;
            }
        }

        private class ParsedFields
        {
            public bool AllRequested { get; set; }
            public HashSet<string> ScalarSelections { get; set; } = new(StringComparer.InvariantCultureIgnoreCase);
            public Dictionary<string, HashSet<string>> CollectionSelections { get; set; } = new(StringComparer.InvariantCultureIgnoreCase);
            public bool IncludeImages { get; set; }
            public bool IncludeTags { get; set; }
            public bool IncludeAuthors { get; set; }
            public bool IncludeCategories { get; set; }
        }
    }
}