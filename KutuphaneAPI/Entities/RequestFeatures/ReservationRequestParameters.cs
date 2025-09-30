namespace Entities.RequestFeatures
{
    public class ReservationRequestParameters : RequestParameters
    {
        public DateOnly? Date { get; set; }
        public int TimeSlotId { get; set; }
    }
}
