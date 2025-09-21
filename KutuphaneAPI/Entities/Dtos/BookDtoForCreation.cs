using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record BookDtoForCreation
    {
        [Required(ErrorMessage = "Başlık gereklidir.")]
        [MinLength(3, ErrorMessage = "Başlık minimum 3 karakter olmalıdır.")]
        public String Title { get; init; } = null!;

        [Required(ErrorMessage = "ISBN gereklidir.")]
        [StringLength(13, MinimumLength = 13, ErrorMessage = "ISBN 13 karakter olmalıdır.")]
        public String ISBN { get; init; } = null!;

        [Required(ErrorMessage = "Mevcut kopya sayısı gereklidir.")]
        [Range(0, int.MaxValue, ErrorMessage = "Mevcut kopya 0 veya daha büyük olmalıdır.")]
        public int AvailableCopies { get; init; }

        [Required(ErrorMessage = "Toplam kopya sayısı gereklidir.")]
        [Range(1, int.MaxValue, ErrorMessage = "Toplam kopya en az 1 olmalıdır.")]
        public int TotalCopies { get; init; }

        [Required(ErrorMessage = "Konum gereklidir.")]
        public String Location { get; init; } = null!;

        [Required(ErrorMessage = "Yayın tarihi gereklidir.")]
        public DateTime PublishedDate { get; init; }

        [Required(ErrorMessage = "Özet gereklidir.")]
        public String Summary { get; init; } = null!;

        public ICollection<int>? AuthorIds { get; init; }
        public ICollection<int>? CategoryIds { get; init; }
        public ICollection<int>? TagIds { get; init; }
        public ICollection<IFormFile>? NewImages { get; init; }
    }
}