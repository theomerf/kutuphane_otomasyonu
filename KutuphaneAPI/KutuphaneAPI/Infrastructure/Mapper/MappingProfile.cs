using AutoMapper;
using Entities.Dtos;
using Entities.Models;

namespace KutuphaneAPI.Infrastructure.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AccountForRegistrationDto, Account>();
            CreateMap<Account, AccountDto>();
            CreateMap<Book, BookDto>();
        }
    }
}
