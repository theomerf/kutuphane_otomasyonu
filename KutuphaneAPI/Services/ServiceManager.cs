using Services.Contracts;

namespace Services
{
    public class ServiceManager : IServiceManager
    {
        private readonly IAccountService _accountService;
        private readonly IBookService _bookService;

        public ServiceManager(IAccountService accountService, IBookService bookService)
        {
            _accountService = accountService;
            _bookService = bookService;
        }

        public IAccountService AccountService => _accountService;
        public IBookService BookService => _bookService;
    }
}
