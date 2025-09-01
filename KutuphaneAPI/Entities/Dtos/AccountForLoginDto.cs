using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Dtos
{
    public class AccountForLoginDto
    {
        [Required(ErrorMessage = "Kullanıcı adı gereklidir.")]
        public String? UserName { get; init; }
        [Required(ErrorMessage = "Şifre gereklidir.")]
        public String? Password { get; init; }
    }
}
