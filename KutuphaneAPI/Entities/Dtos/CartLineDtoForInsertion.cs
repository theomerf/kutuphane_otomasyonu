namespace Entities.Dtos
{
    public record CartLineDtoForInsertion
    {
        public int Id { get; init; }
        public int BookId { get; init; }
        public int CartId { get; init; }
        public int Quantity { get; set; } = 1;
    }
}
