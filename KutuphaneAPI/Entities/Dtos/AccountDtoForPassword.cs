using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record AccountDtoForPassword
    {
        public String Id { get; init; } = null!;
        [Required(ErrorMessage = "Yeni şifre bilgisi gereklidir.")]
        [MaxLength(20, ErrorMessage = "Şifre en fazla 20 karakter olmalıdır.")]
        public String Password { get; init; } = null!;  
    }
}
