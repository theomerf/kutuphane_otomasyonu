using AutoMapper;
using Entities.Dtos;
using Entities.Models;

namespace KutuphaneAPI.Infrastructure.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AccountDtoForRegistration, Account>();
            CreateMap<Account, AccountDto>();
            CreateMap<AccountDtoForCreation, Account>();
            CreateMap<AccountDtoForUpdate, Account>();
            CreateMap<Book, BookDto>();
            CreateMap<BookDtoForCreation, Book>()
                .ForMember(dest => dest.AvailableCopies, opt => opt.MapFrom(src => src.TotalCopies))
                .ForMember(dest => dest.Images, opt => opt.Ignore())
                .ForMember(dest => dest.Reviews, opt => opt.Ignore())
                .ForMember(dest => dest.Tags, opt => opt.Ignore())
                .ForMember(dest => dest.Authors, opt => opt.Ignore())
                .ForMember(dest => dest.Categories, opt => opt.Ignore());
            CreateMap<BookDtoForUpdate, Book>()
                .ForMember(dest => dest.Authors, opt => opt.Ignore())
                .ForMember(dest => dest.Categories, opt => opt.Ignore())
                .ForMember(dest => dest.Tags, opt => opt.Ignore())
                .ForMember(dest => dest.Images, opt => opt.Ignore());
            CreateMap<Category, CategoryDto>()
                .ForMember(dest => dest.BookCount, opt => opt.MapFrom(src => src.Books != null ? src.Books.Count : 0))
                .ReverseMap();
            CreateMap<CategoryDtoForCreation, Category>();
            CreateMap<Author, AuthorDto>()
                .ForMember(dest => dest.BookCount, opt => opt.MapFrom(src => src.Books != null ? src.Books.Count : 0))
                .ReverseMap();
            CreateMap<AuthorDtoForCreation, Author>();
            CreateMap<Cart, CartDto>()
                .ForMember(dest => dest.CartLines, opt => opt.MapFrom(src => src.CartLines))
                .ReverseMap();
            CreateMap<CartLine, CartLineDto>()
                .ForMember(dest => dest.BookId, opt => opt.MapFrom(src => src.Book!.Id))
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book!.Title))
                .ForMember(dest => dest.BookISBN, opt => opt.MapFrom(src => src.Book!.ISBN))
                .ForMember(dest => dest.BookImageUrl, opt => opt.MapFrom(src => src.Book!.Images != null && src.Book.Images.Any() ? src.Book.Images.First().ImageUrl : string.Empty))
                .ReverseMap();
            CreateMap<CartDtoForUpdate, Cart>().ReverseMap();
            CreateMap<CartLine, CartLineDtoForInsertion>()
                .ForMember(dest => dest.BookId, opt => opt.MapFrom(src => src.Book!.Id))
                .ReverseMap();
            CreateMap<Reservation, ReservationDto>().ReverseMap();
            CreateMap<ReservationDtoForCreation, Reservation>()
                .ForMember(dest => dest.ReservationDate, opt => opt.MapFrom(src => DateOnly.Parse(src.ReservationDate)));
            CreateMap<Seat, SeatDto>().ReverseMap();
            CreateMap<TimeSlot, TimeSlotDto>().ReverseMap();
            CreateMap<Tag, TagDto>()
                .ForMember(dest => dest.BookCount, opt => opt.MapFrom(src => src.Books != null ? src.Books.Count : 0));
            CreateMap<TagDtoForCreation, Tag>();
            CreateMap<BookImage, BookImageDto>();
            CreateMap<Loan, LoanDto>()
                .ForMember(dest => dest.LoanLines, opt => opt.MapFrom(src => src.LoanLines))
                .ReverseMap();
            CreateMap<LoanLine, LoanLineDto>()
                .ForMember(dest => dest.BookId, opt => opt.MapFrom(src => src.Book!.Id))
                .ForMember(dest => dest.BookTitle, opt => opt.MapFrom(src => src.Book!.Title))
                .ForMember(dest => dest.BookISBN, opt => opt.MapFrom(src => src.Book!.ISBN))
                .ForMember(dest => dest.AvailableCopies, opt => opt.MapFrom(src => src.Book!.AvailableCopies))
                .ForMember(dest => dest.BookImageUrl, opt => opt.MapFrom(src => src.Book!.Images != null && src.Book.Images.Any() ? src.Book.Images.First().ImageUrl : string.Empty))
                .ReverseMap();
            CreateMap<Penalty, PenaltyDto>().ReverseMap();
            CreateMap<UserReview, UserReviewDto>()
                .ForMember(dest => dest.AccountUserName, opt => opt.MapFrom(src => src.Account!.UserName))
                .ForMember(dest => dest.AccountAvatarUrl, opt => opt.MapFrom(src => src.Account!.AvatarUrl));
            CreateMap<UserReviewDtoForCreation, UserReview>();
            CreateMap<UserReviewDtoForUpdate, UserReview>();
            CreateMap<Notification, NotificationDto>();
            CreateMap<NotificationDtoForCreation, Notification>();
            CreateMap<NotificationDtoForUpdate, Notification>();
        }
    }
}
