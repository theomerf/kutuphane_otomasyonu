using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record CartLineDtoForUpdate
    {
        public int Id { get; init; }
        public required int BookId { get; init; }
        public required int CartId { get; init; }
        public int Quantity { get; set; } = 1;
    }
}
