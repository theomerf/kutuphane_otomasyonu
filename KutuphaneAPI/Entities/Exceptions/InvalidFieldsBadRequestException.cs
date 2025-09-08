using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Exceptions
{
    public sealed class InvalidFieldsBadRequestException : BadRequestException
    {
        public InvalidFieldsBadRequestException(IEnumerable<string> invalidFields)
            : base($"Geçersiz fields parametresi. Hatalı alan(lar): {string.Join(", ", invalidFields)}")
        {
        }
    }
}
