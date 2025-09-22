namespace Entities.RequestFeatures
{
    public class BookRequestParameters : RequestParameters
    {
        public int? AuthorId { get; set; }
        public int? CategoryId { get; set; }
        public bool? IsAvailable { get; set; }
        public String? Fields { get; set; }
        public bool? IsPopular { get; set; }
        public ICollection<int>? CategoryIds { get; set; }
        public ICollection<int>? TagIds { get; set; }
    }
}
