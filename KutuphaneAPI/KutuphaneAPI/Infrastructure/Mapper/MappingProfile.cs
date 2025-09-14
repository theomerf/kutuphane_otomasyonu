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
            CreateMap<Cart, CartDto>()
                .ForMember(dest => dest.CartLines, opt => opt.MapFrom(src => src.CartLines))
                .ReverseMap();
            CreateMap<CartLine, CartLineDto>()
                .ForMember(dest => dest.BookId, opt => opt.MapFrom(src => src.Book!.Id))
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book!.Title))
                .ForMember(dest => dest.BookISBN, opt => opt.MapFrom(src => src.Book!.ISBN))
                .ForMember(dest => dest.BookImageUrl, opt => opt.MapFrom(src => src.Book!.Images != null && src.Book.Images.Any() ? src.Book.Images.First().ImageUrl : string.Empty))
                .ReverseMap();
            CreateMap<CartDtoForUpdate, Cart>();
            CreateMap<CartLineDtoForUpdate, CartLine>();
        }
    }
}
