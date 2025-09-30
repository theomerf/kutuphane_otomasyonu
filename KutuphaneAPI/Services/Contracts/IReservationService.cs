using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface IReservationService
    {
        Task<(IEnumerable<ReservationDto> reservations, MetaData metaData)> GetAllReservationsAsync(ReservationRequestParameters p, bool trackChanges);
        Task<int> GetActiveReservationsCountAsync();
        Task<IEnumerable<ReservationDtoForStatus>> GetAllReservationsForStatusesAsync(ReservationRequestParameters p, bool trackChanges);
        Task<ReservationDto> GetReservationByIdAsync(int reservationId, bool trackChanges);
        Task<IEnumerable<ReservationDto>> GetReservationsOfOneUserAsync(string accountId, bool trackChanges);
        Task<Reservation> ChangeStatusOfReservation(int reservationId, ReservationStatus status);
        Task<Reservation> ChangeStatusOfReservationForUser(int reservationId, ReservationStatus status, string accountId);
        Task CreateReservationAsync(ReservationDtoForCreation reservationDto);
        Task DeleteReservationAsync(int reservationId);
        Task UpdateReservationAsync(Reservation reservationDto);
    }
}
