using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record AccountDtoForCreation
    {
        [MinLength(3, ErrorMessage = "Kullanıcı adı minimum 3 karakter olmalıdır.")]
        [MaxLength(20, ErrorMessage = "Kullanıcı adı en fazla 20 karakter olmalıdır.")]
        [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
        public String UserName { get; init; } = null!;
        public String AvatarUrl { get; init; } = "https://i.hizliresim.com/ntfecdo.png";
        [Required(ErrorMessage = "Ad gereklidir.")]
        [MinLength(2, ErrorMessage = "Ad minimum 2 karakter olmalıdır.")]
        [MaxLength(20, ErrorMessage = "Ad en fazla 20 karakter olmalıdır.")]
        public String FirstName { get; init; } = null!;
        [MinLength(2, ErrorMessage = "Soyad minimum 2 karakter olmalıdır.")]
        [MaxLength(20, ErrorMessage = "Soyad en fazla 20 karakter olmalıdır.")]
        [Required(ErrorMessage = "Soyad gereklidir.")]
        public String LastName { get; init; } = null!;
        [Required(ErrorMessage = "Telefon numarası gereklidir.")]
        public String PhoneNumber { get; init; } = null!;
        [Required(ErrorMessage = "Email gereklidir.")]
        public String Email { get; init; } = null!;
        [Required(ErrorMessage = "Doğum tarihi gereklidir.")]
        public DateOnly? BirthDate { get; init; }
        public ICollection<String> Roles { get; init; } = new List<String>();
        [Required(ErrorMessage = "Şifre gereklidir.")]
        [MinLength(6, ErrorMessage = "Şifre minimum 6 karakter olmalıdır.")]
        [MaxLength(20, ErrorMessage = "Şifre en fazla 20 karakter olmalıdır.")]
        public String Password { get; init; } = null!;
    }
}
