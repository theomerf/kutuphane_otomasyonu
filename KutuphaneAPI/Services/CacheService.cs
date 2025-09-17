using Entities.Dtos;
using Entities.Models;
using Microsoft.Extensions.Caching.Memory;
using Services.Contracts;
using System.Collections.Concurrent;

namespace Services
{
    public class CacheService : ICacheService, IDisposable
    {
        private readonly IMemoryCache _cache;
        private static readonly ConcurrentDictionary<string, SeatTimer> _seatTimers = new();
        private static readonly ConcurrentDictionary<string, string> _userToSeatMapping = new();

        public CacheService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public SeatSelectionResultDto TrySelectSeat(int seatId, string reservationDate, int timeSlotId, string userId)
        {
            var seatKey = $"{seatId}_{reservationDate}_{timeSlotId}";

            var currentHolder = _cache.Get<string>($"holder_{seatKey}");
            if (currentHolder != null && currentHolder != userId)
            {
                return new SeatSelectionResultDto
                {
                    Success = false,
                    CurrentHolder = currentHolder
                };
            }

            var previousSeatReleased = ReleaseUserCurrentSeat(userId);

            var expireTime = DateTime.UtcNow.AddMinutes(1);
            _cache.Set($"holder_{seatKey}", userId, TimeSpan.FromMinutes(1));
            _cache.Set($"expires_{seatKey}", expireTime, TimeSpan.FromMinutes(1));

            _userToSeatMapping.AddOrUpdate(userId, seatKey, (key, oldValue) => seatKey);

            var result = new SeatSelectionResultDto { Success = true, PreviousSeatReleased = previousSeatReleased };

            var timer = new Timer(_ =>
            {
                try
                {
                    _cache.Remove($"holder_{seatKey}");
                    _cache.Remove($"expires_{seatKey}");
                    _seatTimers.TryRemove(seatKey, out SeatTimer? _);
                    _userToSeatMapping.TryRemove(userId, out string? _);

                    result.OnExpired?.Invoke();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Timer error for seat {seatKey}: {ex.Message}");
                }
            }, null, TimeSpan.FromMinutes(1), Timeout.InfiniteTimeSpan);

            _seatTimers.AddOrUpdate(seatKey, new SeatTimer
            {
                Timer = timer,
                Id = seatId,
                ReservationDate = reservationDate,
                TimeSlotId = timeSlotId,
                UserId = userId
            }, (key, oldValue) =>
            {
                oldValue.Timer?.Dispose();
                return new SeatTimer
                {
                    Timer = timer,
                    Id = seatId,
                    ReservationDate = reservationDate,
                    TimeSlotId = timeSlotId,
                    UserId = userId
                };
            });

            return result;
        }

        public bool ReleaseSeat(int seatId, string reservationDate, int timeSlotId, string userId)
        {
            var seatKey = $"{seatId}_{reservationDate}_{timeSlotId}";
            var currentHolder = _cache.Get<string>($"holder_{seatKey}");

            if (currentHolder == userId)
            {
                _cache.Remove($"holder_{seatKey}");
                _cache.Remove($"expires_{seatKey}");
                _userToSeatMapping.TryRemove(userId, out string? _);

                if (_seatTimers.TryRemove(seatKey, out var seatTimer))
                {
                    seatTimer.Timer?.Dispose();
                }

                return true;
            }

            return false;
        }

        public bool ReleaseUserCurrentSeat(string userId)
        {
            if (_userToSeatMapping.TryRemove(userId, out var seatKey))
            {
                _cache.Remove($"holder_{seatKey}");
                _cache.Remove($"expires_{seatKey}");

                if (_seatTimers.TryRemove(seatKey, out var seatTimer))
                {
                    seatTimer.Timer?.Dispose();
                    return true;
                }
            }
            return false;
        }

        public SeatInfoDto? GetUserCurrentSeat(string userId)
        {
            if (_userToSeatMapping.TryGetValue(userId, out var seatKey) &&
                _seatTimers.TryGetValue(seatKey, out var seatTimer))
            {
                return new SeatInfoDto
                {
                    Id = seatTimer.Id,
                    ReservationDate = seatTimer.ReservationDate,
                    TimeSlotId = seatTimer.TimeSlotId
                };
            }
            return null;
        }

        public List<ReservationDtoForStatus> GetTempSelectedSeats(string reservationDate, int timeSlotId)
        {
            var tempSeats = new List<ReservationDtoForStatus>();

            foreach (var kvp in _seatTimers.ToList())
            {
                var seatKey = kvp.Key;
                var parts = seatKey.Split('_');

                if (parts.Length >= 3 &&
                    parts[1] == reservationDate &&
                    int.TryParse(parts[2], out var slotId) &&
                    slotId == timeSlotId)
                {
                    var holder = _cache.Get<string>($"holder_{seatKey}");

                    if (holder != null && int.TryParse(parts[0], out var seatId))
                    {
                        tempSeats.Add(new ReservationDtoForStatus
                        {
                            SeatId = seatId,
                            ReservationDate = reservationDate,
                            TimeSlotId = timeSlotId,
                            Status = ReservationStatus.Temp
                        });
                    }
                    else
                    {
                        _seatTimers.TryRemove(seatKey, out var expiredTimer);
                        expiredTimer?.Timer?.Dispose();

                        if (!string.IsNullOrEmpty(kvp.Value.UserId))
                        {
                            _userToSeatMapping.TryRemove(kvp.Value.UserId, out _);
                        }
                    }
                }
            }

            return tempSeats;
        }

        public void Dispose()
        {
            foreach (var seatTimer in _seatTimers.Values)
            {
                seatTimer.Timer?.Dispose();
            }
            _seatTimers.Clear();
            _userToSeatMapping.Clear();
        }
    }
}