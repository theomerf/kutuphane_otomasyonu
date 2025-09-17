using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record CartDtoForUpdate
    {
        public int Id { get; init; }
        public String? AccountId { get; init; }
        public List<CartLineDtoForInsertion>? CartLines { get; init; }
    }
}
