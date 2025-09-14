namespace Entities.Models
{
    public class CartLine 
    {
        public int Id { get; set; }
        public required int BookId { get; set; }
        public Book? Book { get; set; }
        public Cart? Cart { get; set; }
        public required int CartId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
