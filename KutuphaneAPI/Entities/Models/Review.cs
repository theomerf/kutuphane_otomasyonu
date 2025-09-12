using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Models
{
    public class Review
    {
        public int Id { get; set; }
        public required double Rating { get; set; }
        public String? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int BookId { get; set; }
        public required String AccountId { get; set; }
        public Book? Book { get; set; }
        public Account? Account { get; set; }
    }
}
