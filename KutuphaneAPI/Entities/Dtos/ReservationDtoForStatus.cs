using Entities.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record ReservationDtoForStatus
    {
        public int SeatId { get; init; }
        public int TimeSlotId { get; init; }
        public String ReservationDate { get; init; } = null!;
        public ReservationStatus Status { get; init; }
    }
}
