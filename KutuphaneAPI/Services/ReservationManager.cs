using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Repositories.Contracts;
using Services.Contracts;
using System.Globalization;

namespace Services
{
    public class ReservationManager : IReservationService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly ISeatCacheService _cacheService;

        public ReservationManager(IRepositoryManager manager, IMapper mapper, ISeatCacheService cacheService)
        {
            _manager = manager;
            _mapper = mapper;
            _cacheService = cacheService;
        }

        public async Task<IEnumerable<ReservationDto>> GetAllReservationsAsync(bool trackChanges)
        {
            var reservations = await _manager.Reservation.GetAllReservationsAsync(trackChanges);
            var reservationsDto = _mapper.Map<IEnumerable<ReservationDto>>(reservations);

            return reservationsDto;
        }

        public async Task<IEnumerable<ReservationDtoForStatus>> GetAllReservationsForStatusesAsync(ReservationRequestParameters p, bool trackChanges)
        {
            var dbReservations = await _manager.Reservation.GetAllReservationsForStatusesAsync(p, trackChanges);
            var result = new List<ReservationDtoForStatus>();

            result.AddRange(dbReservations);

            var tempSelectedSeats = _cacheService.GetTempSelectedSeats(p.Date?.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)!, p.TimeSlotId);

            foreach (var tempSeat in tempSelectedSeats)
            {
                var existsInDb = result.Any(r => r.SeatId == tempSeat.SeatId &&
                                               r.ReservationDate == tempSeat.ReservationDate &&
                                               r.TimeSlotId == tempSeat.TimeSlotId);

                if (!existsInDb)
                {
                    result.Add(new ReservationDtoForStatus
                    {
                        SeatId = tempSeat.SeatId,
                        ReservationDate = tempSeat.ReservationDate,
                        TimeSlotId = tempSeat.TimeSlotId,
                        Status = ReservationStatus.Temp,
                    });
                }
            }

            return result;
        }

        public async Task<ReservationDto> GetReservationByIdAsync(int reservationId, bool trackChanges)
        {
            var reservation = await GetReservationByIdForServiceAsync(reservationId, trackChanges);
            var reservationDto = _mapper.Map<ReservationDto>(reservation);

            return reservationDto;
        }

        private async Task<Reservation> GetReservationByIdForServiceAsync(int reservationId, bool trackChanges)
        {
            var reservation = await _manager.Reservation.GetReservationByIdAsync(reservationId, trackChanges);

            if (reservation is null)
            {
                throw new ReservationNotFoundException(reservationId);
            }

            return reservation;
        }

        public async Task<IEnumerable<ReservationDto>> GetReservationsOfOneUserAsync(int accountId, bool trackChanges)
        {
            var reservations = await _manager.Reservation.GetReservationsOfOneUserAsync(accountId, trackChanges);
            
            if (reservations is null)
            {
                throw new ReservationNotFoundException(accountId);
            }
            var reservationsDto = _mapper.Map<IEnumerable<ReservationDto>>(reservations);
           
            return reservationsDto;
        }

        public async Task<Reservation> ChangeStatusOfReservation(int reservationId, ReservationStatus status)
        {
            var reservation = await GetReservationByIdForServiceAsync(reservationId, true);
            reservation.Status = status;
            reservation.UpdatedAt = DateTime.Now;

            _manager.Reservation.UpdateReservation(reservation);
            await _manager.SaveAsync();

            return reservation;
        }

        public async Task CreateReservationAsync(ReservationDtoForCreation reservationDto)
        {
            var reservation = _mapper.Map<Reservation>(reservationDto);

            _manager.Reservation.CreateReservation(reservation);
            await _manager.SaveAsync();
        }

        public async Task DeleteReservationAsync(int reservationId)
        {
            var reservation = await GetReservationByIdForServiceAsync(reservationId, false);

            _manager.Reservation.DeleteReservation(reservation);
            await _manager.SaveAsync();
        }

        public async Task UpdateReservationAsync(Reservation reservationDto)
        {
            var reservation = await GetReservationByIdForServiceAsync(reservationDto.Id, true);
            _mapper.Map(reservationDto, reservation);

            _manager.Reservation.UpdateReservation(reservation);
            await _manager.SaveAsync();
        }
    }
}
