using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Exceptions
{
    public class CartLineNotFoundException : NotFoundException
    {
        public CartLineNotFoundException(int cartLineId)
            : base($"{cartLineId}'sine sahip CartLine bulunamadı.")
        {
        }
    }
}
