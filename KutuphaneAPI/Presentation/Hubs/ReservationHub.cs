using Microsoft.AspNetCore.SignalR;
using Services.Contracts;

namespace Presentation.Hubs
{
    public class ReservationHub : Hub
    {
        private readonly ISeatCacheService _cacheService;

        public ReservationHub(ISeatCacheService cacheService)
        {
            _cacheService = cacheService;
        }

        public async Task JoinDateTimeSlotGroup(string reservationDate, int timeSlotId)
        {
            var groupName = $"date_{reservationDate}_slot_{timeSlotId}";
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task LeaveDateTimeSlotGroup(string reservationDate, int timeSlotId)
        {
            var groupName = $"date_{reservationDate}_slot_{timeSlotId}";
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
        }

        public async Task SelectSeat(int seatId, string reservationDate, int timeSlotId)
        {
            var connectionId = Context.ConnectionId;
            var groupName = $"date_{reservationDate}_slot_{timeSlotId}";

            var result = _cacheService.TrySelectSeat(seatId, reservationDate, timeSlotId, connectionId);

            if (!result.Success)
            {
                await Clients.Caller.SendAsync("SeatAlreadySelected", seatId);
                return;
            }

            result.OnExpired = async () =>
            {
                try
                {
                    await Clients.Group(groupName).SendAsync("SeatReleased", seatId, reservationDate, timeSlotId);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Timer error for seat {seatId}: {ex.Message}");
                }
            };

            await Clients.Group(groupName).SendAsync("SeatSelected", seatId, reservationDate, timeSlotId, connectionId);
        }

        public async Task ReleaseSeat(int seatId, string reservationDate, int timeSlotId)
        {
            var connectionId = Context.ConnectionId;
            var groupName = $"date_{reservationDate}_slot_{timeSlotId}";

            var released = _cacheService.ReleaseSeat(seatId, reservationDate, timeSlotId, connectionId);

            if (released)
            {
                await Clients.Group(groupName).SendAsync("SeatReleased", seatId, reservationDate, timeSlotId);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connectionId = Context.ConnectionId;

            var currentSeat = _cacheService.GetUserCurrentSeat(connectionId);

            if (currentSeat != null)
            {
                var released = _cacheService.ReleaseUserCurrentSeat(connectionId);

                if (released)
                {
                    var groupName = $"date_{currentSeat.ReservationDate}_slot_{currentSeat.TimeSlotId}";
                    try
                    {
                        await Clients.Group(groupName).SendAsync("SeatReleased",
                            currentSeat.Id, currentSeat.ReservationDate, currentSeat.TimeSlotId);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error releasing seat {currentSeat.Id} on disconnect: {ex.Message}");
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
