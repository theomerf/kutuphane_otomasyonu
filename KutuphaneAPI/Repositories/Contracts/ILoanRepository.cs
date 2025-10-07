using Entities.Models;
using Entities.RequestFeatures;

namespace Repositories.Contracts
{
    public interface ILoanRepository : IRepositoryBase<Loan>
    {
        Task<(IEnumerable<Loan> loans, int count)> GetAllLoansAsync(AdminRequestParameters p, bool trackChanges);
        Task<int> GetAllLoansCountAsync();
        Task<Loan?> GetOneLoanByIdAsync(int id, bool trackChanges);
        Task<IDictionary<string, int>> GetLoanStatsByCategoryAsync();
        Task<IEnumerable<Loan>> GetLoansByAccountIdAsync(string accountId, bool trackChanges);
        Task<int> GetLoansCountByAccountIdAsync(string accountId);
        void CreateLoan(Loan loan);
        void UpdateLoan(Loan loan);
        void DeleteLoan(Loan loan);
    }
}
