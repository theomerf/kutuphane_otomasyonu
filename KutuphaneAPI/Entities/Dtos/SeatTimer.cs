using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public class SeatTimer
    {
        public Timer? Timer { get; set; }
        public int Id { get; set; }
        public String ReservationDate { get; set; } = null!;
        public int TimeSlotId { get; set; }
        public String UserId { get; set; } = null!;
    }
}
