namespace Entities.RequestFeatures
{
    public class BookRequestParameters : RequestParameters
    {
        public String? Author { get; set; }
        public String? Title { get; set; }
        public String? Tag { get; set; }
        public String? Category { get; set; }
    }
}
