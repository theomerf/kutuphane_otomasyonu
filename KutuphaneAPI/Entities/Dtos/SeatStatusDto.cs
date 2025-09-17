namespace Entities.Dtos
{
    public record SeatStatusDto
    {
        public int Id { get; init; }
        public bool IsAvailable { get; init; }
    }
}
