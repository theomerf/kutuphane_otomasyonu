using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record AccountForRegistrationDto
    {
        [Required(ErrorMessage = "Ad gereklidir.")]
        [MaxLength(30, ErrorMessage = "Ad en fazla 30 karakter olabilir.")]
        public String? FirstName { get; init; }
        [MaxLength(30, ErrorMessage = "Soyad en fazla 30 karakter olabilir.")]
        [Required(ErrorMessage = "Soyad gereklidir.")]
        public String? LastName { get; init; }
        [MaxLength(20, ErrorMessage = "Kullanıcı adı en fazla 20 karakter olabilir.")]
        [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
        public String? UserName { get; init; }
        [Required(ErrorMessage = "Şifre gereklidir.")]
        [MaxLength(30, ErrorMessage = "Şifre en fazla 30 karakter olabilir.")]
        public String? Password { get; init; }
        [Required(ErrorMessage = "Email gereklidir.")]
        public String? Email { get; init; }
        [Required(ErrorMessage = "Telefon numarası gereklidir.")]
        public String? PhoneNumber { get; init; }
        public ICollection<String>? Roles { get; init; }
    }
}
