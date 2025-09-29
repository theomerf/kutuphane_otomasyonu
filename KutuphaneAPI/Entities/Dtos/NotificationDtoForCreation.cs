using Entities.Models;
using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record NotificationDtoForCreation
    {
        [Required(ErrorMessage = "Başlık alanı gereklidir.")]
        [MaxLength(100, ErrorMessage = "Başlık alanı en fazla 100 karakter olabilir.")]
        public String Title { get; init; } = null!;
        [Required(ErrorMessage = "Mesaj alanı gereklidir.")]
        [MaxLength(500, ErrorMessage = "Mesaj alanı en fazla 500 karakter olabilir.")]
        public String Message { get; init; } = null!;
        public String? AccountId { get; set; }
        [Required(ErrorMessage = "Bildirim tipi gereklidir.")]
        public NotificationType Type { get; init; }
    }
}
