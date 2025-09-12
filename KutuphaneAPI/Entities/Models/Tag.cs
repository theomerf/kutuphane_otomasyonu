namespace Entities.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public required String Name { get; set; }
        public ICollection<Book>? Books { get; set; }
    }
}
