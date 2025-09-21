using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public class BookDtoForUpdate
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Başlık bilgisi gereklidir.")]
        [MinLength(3, ErrorMessage = "Başlık min. 3 karakter olmalıdır.")]
        public string? Title { get; set; }

        [Required(ErrorMessage = "ISBN bilgisi gereklidir.")]
        [StringLength(13, MinimumLength = 13, ErrorMessage = "ISBN 13 karakter olmalıdır.")]
        public string? ISBN { get; set; }

        [Required]
        [Range(0, int.MaxValue, ErrorMessage = "Mevcut kopya 0 veya daha büyük olmalıdır.")]
        public int AvailableCopies { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Toplam kopya en az 1 olmalıdır.")]
        public int TotalCopies { get; set; }

        [Required(ErrorMessage = "Yer bilgisi gereklidir.")]
        public string? Location { get; set; }

        [Required(ErrorMessage = "Yayın tarihi gereklidir.")]
        public DateTime PublishedDate { get; set; }

        [Required(ErrorMessage = "Özet bilgisi gereklidir.")]
        public string? Summary { get; set; }

        public ICollection<int>? AuthorIds { get; set; }
        public ICollection<int>? CategoryIds { get; set; }
        public ICollection<int>? TagIds { get; set; }
        public ICollection<int>? ExistingImageIds { get; set; }
        public List<IFormFile>? NewImages { get; set; }
    }
}