using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Repositories.Contracts;
using Services.Contracts;
using System.Dynamic;

namespace Services
{
    public class BookManager : IBookService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly IDataShaper<BookDto> _dataShaper;

        public BookManager(IRepositoryManager manager, IMapper mapper, IDataShaper<BookDto> dataShaper)
        {
            _manager = manager;
            _mapper = mapper;
            _dataShaper = dataShaper;
        }

        public async Task<(IEnumerable<ExpandoObject> books, MetaData metaData)> GetAllBooksAsync(BookRequestParameters p, bool trackChanges)
        {
            var books = await _manager.Book.GetAllBooksAsync(p, trackChanges);
            var booksDto = _mapper.Map<IEnumerable<BookDto>>(books);

            var shapedData = _dataShaper.ShapeData(booksDto, p.Fields);
            return (shapedData, books.MetaData);
        }

        public async Task<BookDto?> GetOneBookAsync(int id, bool trackChanges)
        {
            var book = await _manager.Book.GetOneBookAsync(id, trackChanges);

            if(book is null)
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


        public async Task CreateBookAsync(BookDto bookDto)
        {
            var book = _mapper.Map<Book>(bookDto);
            _manager.Book.CreateBook(book);
            await _manager.SaveAsync();
        }

        public async Task DeleteBookAsync(int id)
        {
            var book = await GetOneBookForServiceAsync(id, true);
            _manager.Book.DeleteBook(book!);
            await _manager.SaveAsync();
        }

        public async Task UpdateBookAsync(BookDto bookDto)
        {
            var book = await GetOneBookForServiceAsync(bookDto.Id, true);
            if (book is null)
            {
                throw new BookNotFoundException(bookDto.Id);
            }
            _mapper.Map(bookDto, book);
            _manager.Book.UpdateBook(book);
            await _manager.SaveAsync();
        }
    }
}
