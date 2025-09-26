using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record UserReviewDtoForCreation
    {
        [Required(ErrorMessage = "Değerlendirme puanı gereklidir.")]
        [Range(1, 5, ErrorMessage = "Değerlendirme puanı 1 ile 5 arasında olmalıdır.")]
        public int Rating { get; init; }
        public String? Comment { get; init; }
        public String? AccountId { get; set; }
        [Required(ErrorMessage = "Kitap ID'si gereklidir.")]
        public int BookId { get; init; }
    }
}
