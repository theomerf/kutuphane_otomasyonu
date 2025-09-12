using Services.Contracts;

namespace Services
{
    public class ServiceManager : IServiceManager
    {
        private readonly IAccountService _accountService;
        private readonly IBookService _bookService;
        private readonly ICategoryService _categoryService;
        private readonly IAuthorService _authorService;
        private readonly ICartService _cartService;

        public ServiceManager(IAccountService accountService, IBookService bookService, ICategoryService categoryService, IAuthorService authorService, ICartService cartService)
        {
            _accountService = accountService;
            _bookService = bookService;
            _categoryService = categoryService;
            _authorService = authorService;
            _cartService = cartService;
        }

        public IAccountService AccountService => _accountService;
        public IBookService BookService => _bookService;
        public ICategoryService CategoryService => _categoryService;
        public IAuthorService AuthorService => _authorService;
        public ICartService CartService => _cartService;
    }
}
