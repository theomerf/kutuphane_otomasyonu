using System.Text.Json.Serialization;

namespace Entities.Models
{
    public class Author
    {
        public int Id { get; set; }
        public String? Name { get; set; }
        public ICollection<Book>? Books { get; set; }
    }
}
