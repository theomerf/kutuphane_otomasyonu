using System.Text.Json.Serialization;

namespace Entities.Models
{
    public class Tag
    {
        public int Id { get; set; }
        public String? Name { get; set; }
        public ICollection<Book>? Books { get; set; }
    }
}
