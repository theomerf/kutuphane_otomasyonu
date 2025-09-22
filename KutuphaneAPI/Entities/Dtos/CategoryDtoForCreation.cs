using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record CategoryDtoForCreation
    {
        [Required(ErrorMessage = "Kategori adı bilgisi gereklidir.")]
        public String Name { get; init; } = null!;
        public int ParentId { get; init; }
    }
}
