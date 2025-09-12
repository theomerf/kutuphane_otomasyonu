using Repositories.Contracts;

namespace Repositories
{
    public class RepositoryManager : IRepositoryManager
    {
        private readonly RepositoryContext _context;
        private readonly IBookRepository _bookRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IAuthorRepository _authorRepository;
        private readonly ICartRepository _cartRepository;

        public RepositoryManager(RepositoryContext context, IBookRepository bookRepository, ICategoryRepository categoryRepository, IAuthorRepository authorRepository, ICartRepository cartRepository)
        {
            _context = context;
            _bookRepository = bookRepository;
            _categoryRepository = categoryRepository;
            _authorRepository = authorRepository;
            _cartRepository = cartRepository;
        }

        public IBookRepository Book => _bookRepository;
        public ICategoryRepository Category => _categoryRepository;
        public IAuthorRepository Author => _authorRepository;
        public ICartRepository Cart => _cartRepository;

        public void Save()
        {
            _context.SaveChanges();
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
