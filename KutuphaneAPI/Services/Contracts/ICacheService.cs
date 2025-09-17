using Entities.Dtos;

namespace Services.Contracts
{
    public interface ICacheService
    {
        SeatSelectionResultDto TrySelectSeat(int seatId, string reservationDate, int timeSlotId, string userId);
        bool ReleaseSeat(int seatId, string reservationDate, int timeSlotId, string userId);
        bool ReleaseUserCurrentSeat(string userId);
        List<ReservationDtoForStatus> GetTempSelectedSeats(string reservationDate, int timeSlotId);
        SeatInfoDto? GetUserCurrentSeat(string userId);
    }
}
