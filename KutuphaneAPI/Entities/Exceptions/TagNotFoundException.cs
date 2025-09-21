using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Exceptions
{
    public class TagNotFoundException : NotFoundException
    {
        public TagNotFoundException(int id) : base($"{id}'sine sahip etiket bulunamadı.")
        {
        }
    }
}
