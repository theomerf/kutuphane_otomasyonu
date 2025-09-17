using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Repositories.Contracts;
using Services.Contracts;

namespace Services
{
    public class SeatManager : ISeatService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public SeatManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SeatDto>> GetAllSeatsAsync(bool trackChanges)
        {
            var seats = await _manager.Seat.GetAllSeatsAsync(trackChanges);
            var seatsDto = _mapper.Map<IEnumerable<SeatDto>>(seats);



            return seatsDto;
        }

        public async Task<SeatDto?> GetSeatByIdAsync(int seatId, bool trackChanges)
        {
            var seat = await  _manager.Seat.GetSeatByIdAsync(seatId, trackChanges);
            if (seat == null)
            {
                throw new SeatNotFoundException(seatId);
            }
            var seatDto = _mapper.Map<SeatDto>(seat);

            return seatDto;
        }

        private async Task<Seat?> GetSeatByIdForServiceAsync(int seatId, bool trackChanges)
        {
            var seat = await _manager.Seat.GetSeatByIdAsync(seatId, trackChanges);
            if (seat == null)
            {
                throw new SeatNotFoundException(seatId);
            }

            return seat;
        }

        public async Task<IEnumerable<SeatStatusDto>> GetSeatStatusesAsync(bool trackChanges)
        {
            var seatStatuses =  await _manager.Seat.GetSeatStatusesAsync(trackChanges);   

            return seatStatuses;
        }

        public async Task<IEnumerable<TimeSlotDto>> GetAllTimeSlotsAsync(bool trackChanges)
        {
            var timeSlots = await _manager.Seat.GetAllTimeSlotsAsync(trackChanges);
            var timeSlotsDto = _mapper.Map<IEnumerable<TimeSlotDto>>(timeSlots);

            return timeSlotsDto;
        }

        public async Task CreateTimeSlotAsync(TimeSlotDto timeSlotDto)
        {
            var timeSlot = _mapper.Map<TimeSlot>(timeSlotDto);

            _manager.Seat.CreateTimeSlot(timeSlot);
            await _manager.SaveAsync();
        }

        public async Task CreateSeatAsync(SeatDto seatDto)
        {
            var seat = _mapper.Map<Seat>(seatDto);

            _manager.Seat.CreateSeat(seat);
            await _manager.SaveAsync();
        }

        public async Task DeleteSeatAsync(int seatId)
        {
            var seat = await GetSeatByIdForServiceAsync(seatId, true);

            _manager.Seat.DeleteSeat(seat!);
            await _manager.SaveAsync();
        }

        public async Task UpdateSeatAsync(SeatDto seatDto)
        {
            var seat = await GetSeatByIdForServiceAsync(seatDto.Id, true);
            _mapper.Map(seatDto, seat);

            _manager.Seat.UpdateSeat(seat!);
            await _manager.SaveAsync();
        }
    }
}
