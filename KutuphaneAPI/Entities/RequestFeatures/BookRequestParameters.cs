namespace Entities.RequestFeatures
{
    public class BookRequestParameters : RequestParameters
    {
        public int? AuthorId { get; set; }
        public int? CategoryId { get; set; }
        public bool? IsAvailable { get; set; }
        public bool? IsPopular { get; set; }
    }
}
