using Entities.Models;

namespace Repositories.Contracts
{
    public interface ILoanRepository : IRepositoryBase<Loan>
    {
        Task<IEnumerable<Loan>> GetAllLoansAsync(bool trackChanges);
        Task<Loan?> GetOneLoanByIdAsync(int id, bool trackChanges);
        Task<IEnumerable<Loan>> GetLoansByAccountIdAsync(string accountId, bool trackChanges);
        void CreateLoan(Loan loan);
        void UpdateLoan(Loan loan);
        void DeleteLoan(Loan loan);
    }
}
