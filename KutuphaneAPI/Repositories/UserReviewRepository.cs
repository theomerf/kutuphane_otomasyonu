using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class UserReviewRepository : RepositoryBase<UserReview>, IUserReviewRepository
    {
        public UserReviewRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<IEnumerable<UserReview>> GetAllUserReviewsAsync(bool trackChanges)
        {
            var userReviews = await FindAll(trackChanges)
                .Include(ur => ur.Book)
                .ToListAsync();

            return userReviews;
        }

        public async Task<int> GetUserReviewsCountByBookIdAsync(int bookId)
        {
            var count = await FindByCondition(ur => ur.BookId == bookId, false)
                .CountAsync();

            return count;
        }

        public async Task<UserReview?> GetOneUserReviewByIdAsync(int id, bool trackChanges)
        {
            var userReview = await FindByCondition(ur => ur.Id == id, trackChanges)
                .Include(ur => ur.Book)
                .FirstOrDefaultAsync();

            return userReview;
        }

        public async Task<IEnumerable<UserReview>> GetUserReviewsByBookIdAsync(int bookId, bool trackChanges)
        {
            var userReviews = await FindByCondition(ur => ur.BookId == bookId, trackChanges)
                .Include(ur => ur.Book)
                .Include(ur => ur.Account)
                .AsSplitQuery()
                .ToListAsync();

            return userReviews;
        }

        public async Task<IEnumerable<UserReview>> GetUserReviewsByAccountIdAsync(string accountId, bool trackChanges)
        {
            var userReviews = await FindByCondition(ur => ur.AccountId == accountId, trackChanges)
                .Include(ur => ur.Book)
                .ToListAsync();

            return userReviews;
        }

        public void CreateUserReview(UserReview userReview)
        {
            Create(userReview);
        }

        public void DeleteUserReview(UserReview userReview)
        {
            Remove(userReview);
        }

        public void UpdateUserReview(UserReview userReview)
        {
            Update(userReview);
        }
    }
}
