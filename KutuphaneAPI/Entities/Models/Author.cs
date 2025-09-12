namespace Entities.Models
{
    public class Author
    {
        public int Id { get; set; }
        public required String Name { get; set; }
        public ICollection<Book>? Books { get; set; }
    }
}
