using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;
using Repositories.Extensions;

namespace Repositories
{
    public class LoanRepository : RepositoryBase<Loan>, ILoanRepository
    {
        public LoanRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<Loan> loans, int count)> GetAllLoansAsync(AdminRequestParameters p, bool trackChanges)
        {
            var loansQuery = FindAll(trackChanges)
                .Include(l => l.Account)
                .FilterBy(p.SearchTerm, l => l.Account!.UserName!, FilterOperator.Contains)
                .OrderByDescending(l => l.LoanDate);

            var loans = await loansQuery
                .ToPaginate(p.PageSize, p.PageNumber)
                .ToListAsync();

            var count = await loansQuery.CountAsync();

            return (loans, count);
        }

        public async Task<int> GetAllLoansCountAsync()
        {
            var count = await CountAsync(false);

            return count;
        }

        public async Task<IDictionary<string, int>> GetLoanStatsByCategoryAsync()
        {
            var stats = await _context.Set<LoanLine>()
                .Where(ll => ll.Loan != null)
                .Include(ll => ll.Book!)
                    .ThenInclude(b => b.Categories)
                .SelectMany(ll => ll.Book!.Categories!)
                .GroupBy(c => c.Name)
                .Select(g => new
                {
                    CategoryName = g.Key!,
                    LoanCount = g.Count()
                })
                .ToDictionaryAsync(x => x.CategoryName, x => x.LoanCount);

            return stats;
        }

        public async Task<IEnumerable<Loan>> GetLoansByAccountIdAsync(string accountId, bool trackChanges)
        {
            var loans = await FindByCondition(l => l.AccountId == accountId, trackChanges)
                .Include(l => l.LoanLines!)
                .ThenInclude(ll => ll.Book)
                .ThenInclude(b => b!.Images)
                .AsSplitQuery()
                .ToListAsync();

            return loans;
        }

        public async Task<int> GetLoansCountByAccountIdAsync(string accountId)
        {
            var count = await FindByCondition(l => l.AccountId == accountId, false)
                .CountAsync();

            return count;
        }

        public async Task<Loan?> GetOneLoanByIdAsync(int id, bool trackChanges)
        {
            var loans = await FindByCondition(l => l.Id == id, trackChanges)
                .Include(l => l.LoanLines!)
                .ThenInclude(ll => ll.Book)
                .ThenInclude(b => b!.Images)
                .Include(l => l.Account)
                .AsSplitQuery()
                .FirstOrDefaultAsync();

            return loans;
        }

        public void CreateLoan(Loan loan)
        {
            Create(loan);
        }

        public void DeleteLoan(Loan loan)
        {
            Remove(loan);
        }


        public void UpdateLoan(Loan loan)
        {
            Update(loan);
        }
    }
}
