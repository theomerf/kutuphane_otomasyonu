using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public record AccountDtoForUpdate
    {
        public String? Id { get; init; }
        [MinLength(3, ErrorMessage = "Kullanıcı adı minimum 3 karakter olmalıdır.")]
        [MaxLength(20, ErrorMessage = "Kullanıcı adı en fazla 20 karakter olmalıdır.")]
        [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
        public String UserName { get; init; } = null!;
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
        public ICollection<String>? Roles { get; set; }
    }
}
