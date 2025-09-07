using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public class AccountForLoginDto
    {
        [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
        [MinLength(3, ErrorMessage = "Kullanıcı adı minimum 3 karakter olmalıdır.")]
        public String? UserName { get; init; }
        [Required(ErrorMessage = "Şifre gereklidir.")]
        [MinLength(6, ErrorMessage = "Şifre minimum 6 karakter olmalıdır.")]
        public String? Password { get; init; }
        public bool RememberMe { get; init; }
    }
}
