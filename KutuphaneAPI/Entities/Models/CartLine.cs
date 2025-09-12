namespace Entities.Models
{
    public class CartLine 
    {
        public int Id { get; set; }
        public required int BookId { get; set; }
        public required String BookName { get; set; }
        public required String BookImageUrl { get; set; }
        public Cart? Cart { get; set; }
        public required int CartId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
