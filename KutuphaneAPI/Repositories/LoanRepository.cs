using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.Contracts;

namespace Repositories
{
    public class LoanRepository : RepositoryBase<Loan>, ILoanRepository
    {
        public LoanRepository(RepositoryContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Loan>> GetAllLoansAsync(bool trackChanges)
        {
            var loans = await FindAll(trackChanges)
                .Include(l => l.LoanLines)
                .ToListAsync();

            return loans;
        }

        public async Task<IEnumerable<Loan>> GetLoansByAccountIdAsync(string accountId, bool trackChanges)
        {
            var loans = await FindByCondition(l => l.AccountId == accountId, trackChanges)
                .Include(l => l.LoanLines)
                .ToListAsync();

            return loans;
        }

        public async Task<Loan?> GetOneLoanByIdAsync(int id, bool trackChanges)
        {
            var loans = await FindByCondition(l => l.Id == id, trackChanges)
                .Include(l => l.LoanLines)
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
