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
        private readonly INotificationService _notificationService;

        public ReservationManager(IRepositoryManager manager, IMapper mapper, ISeatCacheService cacheService, INotificationService notificationService)
        {
            _manager = manager;
            _mapper = mapper;
            _cacheService = cacheService;
            _notificationService = notificationService;
        }

        public async Task<(IEnumerable<ReservationDto> reservations, MetaData metaData)> GetAllReservationsAsync(ReservationRequestParameters p, bool trackChanges)
        {
            var reservations = await _manager.Reservation.GetAllReservationsAsync(p, trackChanges);
            var reservationsDto = _mapper.Map<IEnumerable<ReservationDto>>(reservations.reservations);

            var pagedReservations = PagedList<ReservationDto>.ToPagedList(reservationsDto, p.PageNumber, p.PageSize, reservations.count);

            return (pagedReservations, pagedReservations.MetaData);
        }

        public async Task<int> GetActiveReservationsCountAsync() => await _manager.Reservation.GetActiveReservationsCountAsync();

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

        public async Task<IEnumerable<ReservationDto>> GetReservationsOfOneUserAsync(string accountId, bool trackChanges)
        {
            var reservations = await _manager.Reservation.GetReservationsOfOneUserAsync(accountId, trackChanges);
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

        public async Task<Reservation> ChangeStatusOfReservationForUser(int reservationId, ReservationStatus status, string accountId)
        {
            var reservation = await GetReservationByIdForServiceAsync(reservationId, true);
            if (reservation.AccountId != accountId)
            {
                throw new AccessViolationException("Bu rezervasyonu değiştirme yetkiniz yok.");
            }

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

            var notificationDto = new NotificationDtoForCreation()
            {
                AccountId = reservationDto.AccountId,
                Title = "Yeni Rezervasyon",
                Message = $"Yeni kütüphane rezervasyonunuz oluşturuldu. Rezervasyon bilgileri: Tarih - {reservationDto.ReservationDate} Koltuk - {reservationDto.SeatId}.",
                Type = NotificationType.Info
            };

            await _notificationService.CreateNotificationAsync(notificationDto);
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
