namespace Entities.Models
{
    public class Cart
    {
        public int Id { get; set; }
        public required String AccountId { get; set; }
        public Account? Account { get; set; }
        public List<CartLine> CartLines { get; set; } = new List<CartLine>();
    }
}
