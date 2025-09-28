namespace Entities.Dtos
{
    public record UserReviewDto
    {
        public int Id { get; init; }
        public int Rating { get; init; }
        public String? Comment { get; init; }
        public DateTime CreatedAt { get; init; }
        public DateTime? UpdatedAt { get; init; }
        public String AccountId { get; init; } = null!;
        public String AccountUserName { get; init; } = null!;
        public String AccountAvatarUrl { get; init; } = null!;
        public int BookId { get; init; }
    }
}
