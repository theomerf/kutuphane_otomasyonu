using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record SeatSelectionResultDto
    {
        public bool Success { get; set; }
        public string? CurrentHolder { get; set; }
        public Action? OnExpired { get; set; }
        public bool PreviousSeatReleased { get; set; }
    }
}
