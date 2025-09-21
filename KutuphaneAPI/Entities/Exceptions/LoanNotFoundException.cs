namespace Entities.Exceptions
{
    public class LoanNotFoundException : NotFoundException
    {
        public LoanNotFoundException(int id) : base($"{id} id'sine sahip ödünç alma kaydı bulunamadı.")
        {
        }
    }
}
