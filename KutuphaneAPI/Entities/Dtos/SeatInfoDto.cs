using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record SeatInfoDto
    {
        public int Id { get; init; }
        public String ReservationDate { get; init; } = null!;
        public int TimeSlotId { get; init; }
    }
}
