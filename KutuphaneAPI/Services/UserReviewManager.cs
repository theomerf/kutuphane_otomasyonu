using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Repositories.Contracts;
using Services.Contracts;
using System.Threading.Tasks;

namespace Services
{
    public class UserReviewManager : IUserReviewService
    {
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;

        public UserReviewManager(IRepositoryManager manager, IMapper mapper)
        {
            _manager = manager;
            _mapper = mapper;
        }

        public async Task<IEnumerable<UserReviewDto>> GetAllUserReviewsAsync(bool trackChanges)
        {
            var reviews = await _manager.UserReview.GetAllUserReviewsAsync(trackChanges);
            var reviewsDto = _mapper.Map<IEnumerable<UserReviewDto>>(reviews);

            return reviewsDto;
        }

        public async Task<UserReviewDto> GetOneUserReviewByIdAsync(int id, bool trackChanges)
        {
            var review = await GetOneUserReviewByIdForServiceAsync(id, trackChanges);
            var reviewDto = _mapper.Map<UserReviewDto>(review);

            return reviewDto;
        }
        private async Task<UserReview> GetOneUserReviewByIdForServiceAsync(int id, bool trackChanges)
        {
            var review = await _manager.UserReview.GetOneUserReviewByIdAsync(id, trackChanges);

            if (review == null)
            {
                throw new UserReviewNotFoundException(id);
            }

            return review;
        }
        public async Task<int> GetUserReviewsCountByBookIdAsync(int bookId)
        {
            var reviewCount = await _manager.UserReview.GetUserReviewsCountByBookIdAsync(bookId);

            return reviewCount;
        }

        public async Task<IEnumerable<UserReviewDto>> GetUserReviewsByBookIdAsync(int bookId, bool trackChanges)
        {
            var review = await _manager.UserReview.GetUserReviewsByBookIdAsync(bookId, trackChanges);
            var reviewDto = _mapper.Map<IEnumerable<UserReviewDto>>(review);

            return reviewDto;
        }

        public async Task<IEnumerable<UserReviewDto>> GetUserReviewsByAccountIdAsync(string accountId, bool trackChanges)
        {
            var review = await _manager.UserReview.GetUserReviewsByAccountIdAsync(accountId, trackChanges);
            var reviewDto = _mapper.Map<IEnumerable<UserReviewDto>>(review);
           
            return reviewDto;
        }

        public async Task<int> GetUserReviewCountByAccountIdAsync(string accountId)
        {
            var reviewCount = await _manager.UserReview.GetUserReviewsCountByAccountIdAsync(accountId);

            return reviewCount;
        }

        public async Task CreateUserReview(UserReviewDtoForCreation userReviewDto)
        {
            var review = _mapper.Map<UserReview>(userReviewDto);
            var book = await _manager.Book.GetOneBookForReviewAsync(userReviewDto.BookId, true);

            book!.AverageRating = ((book.AverageRating * book.Reviews!.Count) + userReviewDto.Rating) / (book.Reviews.Count + 1);

            _manager.UserReview.CreateUserReview(review);
            await _manager.SaveAsync();
        }

        public async Task UpdateUserReview(UserReviewDtoForUpdate userReviewDto)
        {
            var review = await GetOneUserReviewByIdForServiceAsync(userReviewDto.Id, trackChanges: true);

            if (review.AccountId != userReviewDto.AccountId)
            {
                throw new AccessViolationException("Bu yorumu düzenlemek için yetkiniz yok.");
            }
            if (userReviewDto.Rating != review.Rating)
            {
                var book = await _manager.Book.GetOneBookAsync(userReviewDto.BookId, true);

                book!.AverageRating = (((book.AverageRating * book.Reviews!.Count) + userReviewDto.Rating) / (book.Reviews.Count + 1)) / 2;
            }

            _mapper.Map(userReviewDto, review);
            review.UpdatedAt = DateTime.UtcNow;

            await _manager.SaveAsync();
        }

        public async Task DeleteUserReview(int id)
        {
            var review = await GetOneUserReviewByIdForServiceAsync(id, trackChanges: true);

            _manager.UserReview.DeleteUserReview(review);
            await _manager.SaveAsync();
        }
    }
}
