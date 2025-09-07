namespace Services.Contracts
{
    public interface IServiceManager
    {
        IAccountService AccountService { get; }
        IBookService BookService { get; }
    }
}
