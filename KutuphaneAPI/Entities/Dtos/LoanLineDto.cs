using Entities.Models;

namespace Entities.Dtos
{
    public record LoanLineDto
    {
        public int Id { get; set; }
        public int LoanId { get; set; }
        public int BookId { get; set; }
        public String? BookTitle { get; set; }
        public int AvailableCopies { get; set; }    
        public String? BookISBN { get; set; }
        public String? BookImageUrl { get; set; }
        public int Quantity { get; set; }
    }
}
