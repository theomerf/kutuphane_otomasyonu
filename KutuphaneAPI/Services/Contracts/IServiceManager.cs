namespace Services.Contracts
{
    public interface IServiceManager
    {
        IAccountService AccountService { get; }
        IBookService BookService { get; }
        ICategoryService CategoryService { get; }
        IAuthorService AuthorService { get; }
    }
}
