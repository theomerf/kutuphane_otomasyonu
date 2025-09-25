using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record AccountDtoForUpdate : AccountDtoForCreation
    {
        public String? Id { get; init; }
    }
}
