using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record CategoryDto
    {
        public int Id { get; init; }
        public String? Name { get; init; }
        public int? ParentId { get; init; }
        public int BookCount { get; init; }
    }
}
