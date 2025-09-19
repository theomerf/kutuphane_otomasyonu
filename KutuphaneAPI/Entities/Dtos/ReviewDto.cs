using Entities.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record ReviewDto
    {
        public int Id { get; init; }
        public double Rating { get; init; }
        public String? Comment { get; init; }
        public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; init; }
        public int BookId { get; init; }
        public String? AccountId { get; init; }
    }
}
