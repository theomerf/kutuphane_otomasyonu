using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Services.Contracts;
using System.Dynamic;

namespace Services
{
    public class BookManager : IBookService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public BookManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }

        public async Task<(IEnumerable<ExpandoObject> books, MetaData metaData)> GetAllBooksAsync(BookRequestParameters p, bool trackChanges)
        {
            var books = await _manager.Book.GetAllBooksAsync(p, trackChanges);

            var pagedBooks = PagedList<ExpandoObject>.ToPagedList(books.data, p.PageNumber, p.PageSize, books.count);

            return (pagedBooks, pagedBooks.MetaData);
        }

        public async Task<int> GetAllBooksCountAsync() => await _manager.Book.GetAllBooksCountAsync();

        public async Task<IEnumerable<ExpandoObject>> GetRelatedBooksAsync(int id, BookRequestParameters p, bool trackChanges)
        {
            var books = await _manager.Book.GetRelatedBooksAsync(id, p, trackChanges);

            return books;
        }

        public async Task<BookDto?> GetOneBookAsync(int id, bool trackChanges)
        {
            var book = await _manager.Book.GetOneBookAsync(id, trackChanges);

            if (book is null)
            {
                throw new BookNotFoundException(id);
            }
            var bookDto = _mapper.Map<BookDto>(book);

            return bookDto;
        }
        public async Task<Book?> GetOneBookForServiceAsync(int id, bool trackChanges)
        {
            var book = await _manager.Book.GetOneBookAsync(id, trackChanges);

            if (book is null)
            {
                throw new BookNotFoundException(id);
            }

            return book;
        }

        public async Task<IEnumerable<BookDto>> GetFavoriteBooksAsync(ICollection<int> ids, bool trackChanges)
        {
            var books = await _manager.Book.GetFavoriteBooksAsync(ids, trackChanges);
            var booksDto = _mapper.Map<IEnumerable<BookDto>>(books);

            return booksDto;
        }

        public async Task CreateBookAsync(BookDtoForCreation bookDto, List<string> newFilePaths)
        {
            var book = new Book
            {
                Title = bookDto.Title,
                ISBN = bookDto.ISBN,
                AvailableCopies = bookDto.AvailableCopies,
                TotalCopies = bookDto.TotalCopies,
                Location = bookDto.Location,
                PublishedDate = bookDto.PublishedDate,
                Summary = bookDto.Summary,
                Authors = new List<Author>(),
                Categories = new List<Category>(),
                Tags = new List<Tag>(),
                Images = new List<BookImage>()
            };

            if (bookDto.AuthorIds != null && bookDto.AuthorIds.Any())
            {
                foreach (var authorId in bookDto.AuthorIds)
                {
                    var author = new Author { Id = authorId };
                    _manager.Author.Attach(author);
                    book.Authors.Add(author);
                }
            }

            if (bookDto.CategoryIds != null && bookDto.CategoryIds.Any())
            {
                foreach (var categoryId in bookDto.CategoryIds)
                {
                    var category = new Category { Id = categoryId };
                    _manager.Category.Attach(category);
                    book.Categories.Add(category);
                }
            }

            if (bookDto.TagIds != null && bookDto.TagIds.Any())
            {
                foreach (var tagId in bookDto.TagIds)
                {
                    var tag = new Tag { Id = tagId };
                    _manager.Tag.Attach(tag);
                    book.Tags.Add(tag);
                }
            }

            _manager.Book.CreateBook(book);
            await _manager.SaveAsync();

            if (bookDto.IsImagesUrl && bookDto.NewImagesUrl != null && bookDto.NewImagesUrl.Any())
            {
                foreach (var imageUrl in bookDto.NewImagesUrl)
                {
                    var bookImage = new BookImage
                    {
                        BookId = book.Id,
                        ImageUrl = imageUrl,
                        IsPrimary = false,
                        Caption = $"{book.Title} Fotoğrafı"
                    };
                    book.Images!.Add(bookImage);
                }
            }

            if (newFilePaths != null && newFilePaths.Any())
            {
                int i = 0;
                foreach (var filePath in newFilePaths)
                {
                    i++;
                    if (i == 1)
                    {
                        var bookImage = new BookImage
                        {
                            BookId = book.Id,
                            ImageUrl = filePath,
                            IsPrimary = true,
                            Caption = $"{book.Title} Fotoğrafı"
                        };
                        book.Images!.Add(bookImage);
                    }
                    else
                    {
                        var bookImage = new BookImage
                        {
                            BookId = book.Id,
                            ImageUrl = filePath,
                            IsPrimary = false,
                            Caption = $"{book.Title} Fotoğrafı"
                        };
                        book.Images!.Add(bookImage);
                    }
                }
            }

            await _manager.SaveAsync();
        }


        public async Task DeleteBookAsync(int id)
        {
            var book = await GetOneBookForServiceAsync(id, true);
            _manager.Book.DeleteBook(book!);
            await _manager.SaveAsync();
        }

        public async Task UpdateBookAsync(BookDtoForUpdate bookDto, List<string>? newFilePaths)
        {
            var book = await _manager.Book.GetOneBookAsync(bookDto.Id, true);
            if (book is null)
            {
                throw new BookNotFoundException(bookDto.Id);
            }

            book.Title = bookDto.Title;
            book.ISBN = bookDto.ISBN;
            book.AvailableCopies = bookDto.AvailableCopies;
            book.TotalCopies = bookDto.TotalCopies;
            book.Location = bookDto.Location;
            book.PublishedDate = bookDto.PublishedDate;
            book.Summary = bookDto.Summary;

            var tasks = new List<Task>();

            if (bookDto.AuthorIds != null)
            {
                tasks.Add(UpdateBookAuthorsAsync(book, bookDto.AuthorIds));
            }

            if (bookDto.CategoryIds != null)
            {
                tasks.Add(UpdateBookCategoriesAsync(book, bookDto.CategoryIds));
            }

            if (bookDto.TagIds != null)
            {
                tasks.Add(UpdateBookTagsAsync(book, bookDto.TagIds));
            }

            tasks.Add(UpdateBookImagesAsync(book, bookDto, newFilePaths));

            await Task.WhenAll(tasks);

            _manager.Book.UpdateBook(book);
            await _manager.SaveAsync();
        }

        private async Task UpdateBookAuthorsAsync(Book book, ICollection<int> authorIds)
        {
            if (authorIds == null || !authorIds.Any())
            {
                book.Authors?.Clear();
                return;
            }

            var existingAuthorIds = book.Authors?.Select(a => a.Id).ToList() ?? new List<int>();
            var authorsToAddIds = authorIds.Except(existingAuthorIds).ToList();

            var authorsToAdd = authorsToAddIds.Any()
                ? await _manager.Author.FindByCondition(a => authorsToAddIds.Contains(a.Id), true).ToListAsync()
                : new List<Author>();

            book.Authors = book.Authors?
                .Where(a => authorIds.Contains(a.Id))
                .Concat(authorsToAdd)
                .ToList();
        }

        private async Task UpdateBookTagsAsync(Book book, ICollection<int> tagIds)
        {
            if (tagIds == null || !tagIds.Any())
            {
                book.Tags?.Clear();
                return;
            }

            var existingTagIds = book.Tags?.Select(t => t.Id).ToList() ?? new List<int>();
            var tagsToAddIds = tagIds.Except(existingTagIds).ToList();

            var tagsToAdd = tagsToAddIds.Any()
                ? await _manager.Tag.FindByCondition(t => tagsToAddIds.Contains(t.Id), true).ToListAsync()
                : new List<Tag>();

            book.Tags = book.Tags?
                .Where(t => tagIds.Contains(t.Id))
                .Concat(tagsToAdd)
                .ToList();
        }

        private async Task UpdateBookCategoriesAsync(Book book, ICollection<int> categoryIds)
        {
            if (categoryIds == null || !categoryIds.Any())
            {
                book.Categories?.Clear();
                return;
            }

            var existingCategoryIds = book.Categories?.Select(c => c.Id).ToList() ?? new List<int>();
            var categoriesToAddIds = categoryIds.Except(existingCategoryIds).ToList();

            var categoriesToAdd = categoriesToAddIds.Any()
                ? await _manager.Category.FindByCondition(c => categoriesToAddIds.Contains(c.Id), true).ToListAsync()
                : new List<Category>();

            book.Categories = book.Categories?
                .Where(c => categoryIds.Contains(c.Id))
                .Concat(categoriesToAdd)
                .ToList();
        }

        private async Task UpdateBookImagesAsync(Book book, BookDtoForUpdate bookDto, List<string>? newFilePaths)
        {
            if (bookDto.ExistingImageIds != null)
            {
                var imagesToKeep = book.Images?.Where(img => bookDto.ExistingImageIds.Contains(img.Id)).ToList();
                if (imagesToKeep != null)
                {
                    var imagesToDelete = book.Images?.Except(imagesToKeep).ToList();
                    foreach (var img in imagesToDelete ?? new List<BookImage>())
                    {
                        if (File.Exists(img.ImageUrl))
                        {
                            File.Delete(img.ImageUrl);
                        }
                        await _manager.Book.DeleteBookImageAsync(img.Id);
                    }
                }

                book.Images = imagesToKeep;
            }
            else
            {
                book.Images?.Clear();
            }

            if (newFilePaths != null && newFilePaths.Any())
            {
                int i = 0;
                foreach (var filePath in newFilePaths)
                {
                    i++;
                    if (i == 1)
                    {
                        var bookImage = new BookImage
                        {
                            BookId = book.Id,
                            ImageUrl = filePath,
                            IsPrimary = true,
                            Caption = $"{book.Title} Fotoğrafı"
                        };
                        book.Images!.Add(bookImage);
                    }
                    else
                    {
                        var bookImage = new BookImage
                        {
                            BookId = book.Id,
                            ImageUrl = filePath,
                            IsPrimary = false,
                            Caption = $"{book.Title} Fotoğrafı"
                        };
                        book.Images!.Add(bookImage);
                    }
                }
            }

            if (bookDto.IsImagesUrl && bookDto.NewImagesUrl != null && bookDto.NewImagesUrl.Any())
            {
                foreach (var imageUrl in bookDto.NewImagesUrl)
                {
                    var bookImage = new BookImage
                    {
                        BookId = book.Id,
                        ImageUrl = imageUrl,
                        IsPrimary = false,
                        Caption = $"{book.Title} Fotoğrafı"
                    };
                    book.Images!.Add(bookImage);
                }
            }
        }
    }
}
