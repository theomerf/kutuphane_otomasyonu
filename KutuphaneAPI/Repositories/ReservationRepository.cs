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
        public async Task<IEnumerable<Reservation>> GetAllReservationsAsync(bool trackChanges)
        {
            var reservations = await FindAll(trackChanges)
                .Include(r => r.Seat)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return reservations;
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

        public async Task<IEnumerable<Reservation>> GetReservationsOfOneUserAsync(int accountId, bool trackChanges)
        {
            var reservations = await FindByCondition(r => r.AccountId!.Equals(accountId), trackChanges)
                .Include(r => r.Seat)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return reservations;
        }

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
