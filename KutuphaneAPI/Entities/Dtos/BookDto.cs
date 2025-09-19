namespace Entities.Dtos
{
    public record BookDto
    {
        public int Id { get; init; }
        public String? ISBN { get; init; }
        public String? Title { get; init; }
        public int TotalCopies { get; init; }
        public int AvailableCopies { get; init; }
        public String? Location { get; init; }
        public DateTime PublishedDate { get; init; }
        public String? Summary { get; init; }
        public double AverageRating { get; init; }
        public ICollection<BookImageDto>? Images { get; init; }
        public ICollection<TagDto>? Tags { get; init; }
        public ICollection<AuthorDto>? Authors { get; init; }
        public ICollection<CategoryDto>? Categories { get; init; }
        public ICollection<ReviewDto>? Reviews { get; init; }
        public ICollection<CartLineDto>? CartLines { get; init; }
    }
}
