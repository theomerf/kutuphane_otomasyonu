using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Exceptions
{
    public class TimeSlotNotFoundException : NotFoundException
    {
        public TimeSlotNotFoundException(int timeSlotId) : base($"{timeSlotId} id'li zaman dilimi bulunamadı.")
        {
        }
    }
}
