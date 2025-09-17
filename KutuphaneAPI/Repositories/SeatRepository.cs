using Entities.Dtos;
using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class SeatRepository : RepositoryBase<Seat>, ISeatRepository
    {
        public SeatRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Seat>> GetAllSeatsAsync(bool trackChanges)
        {
            var seats = await FindAll(trackChanges)
                .ToListAsync();

            return seats;
        }

        public async Task<Seat?> GetSeatByIdAsync(int seatId, bool trackChanges)
        {
            var seats = await FindByCondition(s => s.Id.Equals(seatId), trackChanges)
                .Include(s => s.Reservations)
                .FirstOrDefaultAsync();

            return seats;
        }

        public async Task<IEnumerable<SeatStatusDto>> GetSeatStatusesAsync(bool trackChanges)
        {
            var seatStatuses = await FindAll(trackChanges)
                .Select(s => new SeatStatusDto
                {
                    Id = s.Id,
                })
                .ToListAsync();

            return seatStatuses;
        }

        public async Task<IEnumerable<TimeSlot>> GetAllTimeSlotsAsync(bool trackChanges)
        {
            var now = TimeOnly.FromDateTime(DateTime.Now);

            var timeSlots = await _context.Set<TimeSlot>()
                .ToListAsync();
            
            return timeSlots;
        }

        public void CreateTimeSlot(TimeSlot timeSlot)
        {
            _context.Set<TimeSlot>().Add(timeSlot);
        }


        public void CreateSeat(Seat seat)
        {
            Create(seat);
        }

        public void DeleteSeat(Seat seat)
        {
            Remove(seat);
        }

        public void UpdateSeat(Seat seat)
        {
            Update(seat);
        }
    }
}
