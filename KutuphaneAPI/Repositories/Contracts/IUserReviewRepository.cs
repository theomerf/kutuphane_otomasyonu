using Entities.Models;

namespace Repositories.Contracts
{
    public interface IUserReviewRepository : IRepositoryBase<UserReview>
    {
        Task<IEnumerable<UserReview>> GetAllUserReviewsAsync(bool trackChanges);
        Task<UserReview?> GetOneUserReviewByIdAsync(int id, bool trackChanges);
        Task<int> GetUserReviewsCountByBookIdAsync(int bookId);
        Task<IEnumerable<UserReview>> GetUserReviewsByBookIdAsync(int bookId, bool trackChanges);
        Task<IEnumerable<UserReview>> GetUserReviewsByAccountIdAsync(string accountId, bool trackChanges);
        Task<int> GetUserReviewsCountByAccountIdAsync(string accountId);
        void CreateUserReview(UserReview userReview);
        void UpdateUserReview(UserReview userReview);
        void DeleteUserReview(UserReview userReview);
    }
}
