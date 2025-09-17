using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface IReservationService
    {
        Task<IEnumerable<ReservationDto>> GetAllReservationsAsync(bool trackChanges);
        Task<IEnumerable<ReservationDtoForStatus>> GetAllReservationsForStatusesAsync(ReservationRequestParameters p, bool trackChanges);
        Task<ReservationDto> GetReservationByIdAsync(int reservationId, bool trackChanges);
        Task<IEnumerable<ReservationDto>> GetReservationsOfOneUserAsync(int accountId, bool trackChanges);
        Task<Reservation> ChangeStatusOfReservation(int reservationId, ReservationStatus status);
        Task CreateReservationAsync(ReservationDtoForCreation reservationDto);
        Task DeleteReservationAsync(int reservationId);
        Task UpdateReservationAsync(Reservation reservationDto);
    }
}
