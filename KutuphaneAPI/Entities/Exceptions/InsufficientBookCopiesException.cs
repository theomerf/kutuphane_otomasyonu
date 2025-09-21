namespace Entities.Exceptions
{
    public class InsufficientBookCopiesException : BadRequestException
    {
        public InsufficientBookCopiesException(string bookTitle, int availableCopies, int requestedCopies)
            : base($"Yeterlli kitap yok.'{bookTitle}'. Mevcut: {availableCopies}, İstenen: {requestedCopies}.")
        {
        }
    }
}
