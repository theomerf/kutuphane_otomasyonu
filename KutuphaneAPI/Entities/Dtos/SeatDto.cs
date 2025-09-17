namespace Entities.Dtos
{
    public record SeatDto
    {
        public int Id { get; init; }
        public int SeatNumber { get; init; }
        public String? Location { get; init; }
        public int Floor { get; init; }
        public bool IsAvailable { get; init; }
    }
}
