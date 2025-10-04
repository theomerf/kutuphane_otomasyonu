using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface IReservationRepository : IRepositoryBase<Reservation>
    {
        Task<(IEnumerable<Reservation> reservations, int count)> GetAllReservationsAsync(ReservationRequestParameters p, bool trackChanges);
        Task<int> GetActiveReservationsCountAsync();
        Task<IEnumerable<ReservationDtoForStatus>> GetAllReservationsForStatusesAsync(ReservationRequestParameters p, bool trackChanges);
        Task<Reservation?> GetReservationByIdAsync(int reservationId, bool trackChanges);
        Task<IEnumerable<Reservation>> GetReservationsOfOneUserAsync(string accountId, bool trackChanges);
        Task<int> GetReservationsCountOfOneUserAsync(string accountId);
        void CreateReservation(Reservation reservation);
        void DeleteReservation(Reservation reservation);
        void UpdateReservation(Reservation reservation);
    }
}
