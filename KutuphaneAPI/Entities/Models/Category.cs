namespace Entities.Models
{
    public class Category
    {
        public int Id { get; set; }
        public String? Name { get; set; }
        public int? ParentId { get; set; }
        public ICollection<Book>? Books { get; set; }
    }
}
