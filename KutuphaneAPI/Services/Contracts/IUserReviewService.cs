using Entities.Dtos;
using Entities.Models;

namespace Services.Contracts
{
    public interface IUserReviewService
    {
        Task<IEnumerable<UserReviewDto>> GetAllUserReviewsAsync(bool trackChanges);
        Task<UserReviewDto> GetOneUserReviewByIdAsync(int id, bool trackChanges);
        Task<int> GetUserReviewsCountByBookIdAsync(int bookId);
        Task<IEnumerable<UserReviewDto>> GetUserReviewsByBookIdAsync(int bookId, bool trackChanges);
        Task<IEnumerable<UserReviewDto>> GetUserReviewsByAccountIdAsync(string accountId, bool trackChanges);
        Task CreateUserReview(UserReviewDtoForCreation userReviewDto);
        Task UpdateUserReview(UserReviewDtoForUpdate userReviewDto);
        Task DeleteUserReview(int id);
    }
}
