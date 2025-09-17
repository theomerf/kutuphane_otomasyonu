using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record ReservationDtoForCreation
    {
        public String? AccountId { get; set; }
        public int SeatId { get; init; }
        public int TimeSlotId { get; init; }
        public String ReservationDate { get; init; } = null!;
    }
}
