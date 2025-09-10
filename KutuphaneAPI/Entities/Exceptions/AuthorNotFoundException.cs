namespace Entities.Exceptions
{
    public sealed class AuthorNotFoundException : NotFoundException
    {
        public AuthorNotFoundException(int id)
        : base($"{id}'sine sahip yazar bulunamadı.")
        {
        }
    }
}
