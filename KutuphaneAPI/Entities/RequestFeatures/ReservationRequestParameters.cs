namespace Entities.RequestFeatures
{
    public class ReservationRequestParameters
    {
        public DateOnly? Date { get; set; }
        public int TimeSlotId { get; set; }
    }
}
