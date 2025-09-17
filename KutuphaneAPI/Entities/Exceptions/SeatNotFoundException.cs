namespace Entities.Exceptions
{
    public class SeatNotFoundException : NotFoundException
    {
        public SeatNotFoundException(int id)
            : base($"{id}'sine sahip koltuk bulunamadı.")
        {
        }
    }
}
