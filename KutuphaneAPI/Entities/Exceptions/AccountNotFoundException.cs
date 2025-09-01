using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Exceptions
{
    public class AccountNotFoundException : NotFoundException
    {
        public AccountNotFoundException(String userName) : base($"{userName} kullanıcı adına sahip kullanıcı bulunamadı.")
        {
        }
    }
}
