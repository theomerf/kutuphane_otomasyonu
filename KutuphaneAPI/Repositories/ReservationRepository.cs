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
