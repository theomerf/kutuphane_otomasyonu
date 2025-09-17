using Entities.Dtos;
using Entities.Models;

namespace Repositories.Contracts
{
    public interface ISeatRepository : IRepositoryBase<Seat>
    {
        Task<IEnumerable<Seat>> GetAllSeatsAsync(bool trackChanges);
        Task<IEnumerable<SeatStatusDto>> GetSeatStatusesAsync(bool trackChanges);
        Task<Seat?> GetSeatByIdAsync(int seatId, bool trackChanges);
        Task<IEnumerable<TimeSlot>> GetAllTimeSlotsAsync(bool trackChanges);
        void CreateTimeSlot(TimeSlot timeSlot);
        void CreateSeat(Seat seat);
        void DeleteSeat(Seat seat);
        void UpdateSeat(Seat seat);
    }
}
