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
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.BookCount, opt => opt.MapFrom(src => src.Books != null ? src.Books.Count : 0))
                .ReverseMap();
            CreateMap<Author, AuthorDto>()
                .ForMember(dest => dest.BookCount, opt => opt.MapFrom(src => src.Books != null ? src.Books.Count : 0))
                .ReverseMap();
            CreateMap<Cart, CartDto>();
            CreateMap<CartLine, CartLineDto>();
        }
    }
}
