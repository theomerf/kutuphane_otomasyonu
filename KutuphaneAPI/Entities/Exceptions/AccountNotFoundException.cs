namespace Entities.Exceptions
{
    public class AccountNotFoundException : NotFoundException
    {
        public AccountNotFoundException(String userName) : base($"{userName} kullanıcı adına sahip kullanıcı bulunamadı.")
        {
        }
    }
}
