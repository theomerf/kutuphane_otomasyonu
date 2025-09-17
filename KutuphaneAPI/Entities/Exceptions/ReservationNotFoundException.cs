namespace Entities.Exceptions
{
    public class ReservationNotFoundException : NotFoundException
    {
        public ReservationNotFoundException(int id) : base($"{id} id'sine sahip rezervasyon bulunamadı.")
        {
        }
    }
}
