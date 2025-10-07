using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class ReservationRepository : RepositoryBase<Reservation>, IReservationRepository
    {
        public ReservationRepository(RepositoryContext context) : base(context)
        {
        }
        public async Task<(IEnumerable<Reservation> reservations, int count)> GetAllReservationsAsync(ReservationRequestParameters p, bool trackChanges)
        {
            var reservationQuery = FindAll(trackChanges)
                .Include(r => r.Seat)
                .Include(r => r.Account)
                .FilterBy(p.Date, r => r.ReservationDate, FilterOperator.Equal)
                .FilterBy(p.TimeSlotId, r => r.TimeSlotId, FilterOperator.Equal)
                .OrderByDescending(r => r.CreatedAt);
            
            var reservations = await reservationQuery
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            var count = await reservationQuery.CountAsync();

            return (reservations, count);
        }

        public async Task<int> GetActiveReservationsCountAsync() => await FindByCondition(r => r.Status == ReservationStatus.Active, false).CountAsync();

        public async Task<IDictionary<string, int>> GetReservationsCountOfMonthDailyAsync()
        {
            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1);
            var endOfMonth = startOfMonth.AddMonths(1);

            var startDate = DateOnly.FromDateTime(startOfMonth);
            var endDate = DateOnly.FromDateTime(endOfMonth);

            var reservations = await FindByCondition(
                r => r.ReservationDate >= startDate && r.ReservationDate < endDate,
                trackChanges: false)
                .Select(r => r.ReservationDate)
                .ToListAsync();

            var stats = reservations
                .GroupBy(date => date.ToString("yyyy-MM-dd"))
                .OrderBy(g => g.Key)
                .ToDictionary(g => g.Key, g => g.Count());

            var allDaysInMonth = Enumerable.Range(1, DateTime.DaysInMonth(now.Year, now.Month))
                .Select(day => new DateTime(now.Year, now.Month, day).ToString("yyyy-MM-dd"))
                .ToDictionary(date => date, date => stats.ContainsKey(date) ? stats[date] : 0);

            return allDaysInMonth;
        }

        public async Task<IEnumerable<ReservationDtoForStatus>> GetAllReservationsForStatusesAsync(ReservationRequestParameters p, bool trackChanges)
        {
            var reservationsStatus = await FindAll(trackChanges)
                .FilterBy(p.Date, r => r.ReservationDate, FilterOperator.Equal)
                .FilterBy(p.TimeSlotId, r => r.TimeSlotId, FilterOperator.Equal)
                .Select(r => new ReservationDtoForStatus
                {
                    SeatId = r.SeatId,
                    ReservationDate = r.ReservationDate.ToString(),
                    TimeSlotId = r.TimeSlotId,
                    Status = r.Status,
                })
                .ToListAsync();

            return reservationsStatus;
        }

        public async Task<Reservation?> GetReservationByIdAsync(int reservationId, bool trackChanges)
        {
            var reservation = await FindByCondition(r => r.Id.Equals(reservationId), trackChanges)
                .Include(r => r.Seat)
                .FirstOrDefaultAsync();

            return reservation;
        }

        public async Task<IEnumerable<Reservation>> GetReservationsOfOneUserAsync(string accountId, bool trackChanges)
        {
            var reservations = await FindByCondition(r => r.AccountId!.Equals(accountId), trackChanges)
                .Include(r => r.Seat)
                .Include(r => r.TimeSlot)
                .AsSplitQuery()
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return reservations;
        }   

        public async Task<int> GetReservationsCountOfOneUserAsync(string accountId) => await FindByCondition(r => r.AccountId!.Equals(accountId), false).CountAsync();

        public void CreateReservation(Reservation reservation)
        {
            Create(reservation);
        }

        public void DeleteReservation(Reservation reservation)
        {
            Remove(reservation);
        }

        public void UpdateReservation(Reservation reservation)
        {
            Update(reservation);
        }
    }
}
