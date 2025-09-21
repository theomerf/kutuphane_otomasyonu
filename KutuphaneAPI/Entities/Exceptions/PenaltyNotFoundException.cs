namespace Entities.Exceptions
{
    public class PenaltyNotFoundException : NotFoundException
    {
        public PenaltyNotFoundException(int id) : base($"{id} id'sine sahip ceza kaydı bulunamadı.")
        {
        }
    }
}
