using Entities.Dtos;
using Entities.Models;

namespace Services.Contracts
{
    public interface ISeatService
    {
        Task<IEnumerable<SeatDto>> GetAllSeatsAsync(bool trackChanges);
        Task<IEnumerable<SeatStatusDto>> GetSeatStatusesAsync(bool trackChanges);
        Task<SeatDto?> GetSeatByIdAsync(int seatId, bool trackChanges);
        Task<IEnumerable<TimeSlotDto>> GetAllTimeSlotsAsync(bool trackChanges);
        Task CreateTimeSlotAsync(TimeSlotDto timeSlotDto);
        Task CreateSeatAsync(SeatDto seatDto);
        Task DeleteSeatAsync(int seatId);
        Task UpdateSeatAsync(SeatDto seatDto);
    }
}
