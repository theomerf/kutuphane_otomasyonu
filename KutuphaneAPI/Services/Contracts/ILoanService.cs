using Entities.Dtos;
using Entities.Models;
using Entities.RequestFeatures;

namespace Services.Contracts
{
    public interface ILoanService
    {
        Task<(IEnumerable<LoanDto> loans, MetaData metaData)> GetAllLoansAsync(AdminRequestParameters p, bool trackChanges);
        Task<int> GetAllLoansCountAsync();
        Task<LoanDto> GetOneLoanByIdAsync(int id, bool trackChanges);
        Task<IEnumerable<LoanDto>> GetLoansByAccountIdAsync(string accountId, bool trackChanges);
        Task<int> GetLoansCountByAccountIdAsync(string accountId);
        Task ChangeStatusOfLoanAsync(int loanId, LoanStatus status);
        Task CreateLoanAsync(LoanDto loanDto);
        Task UpdateLoanAsync(LoanDto loanDto);
        Task DeleteLoanAsync(int loanId);
        Task DeleteLoanForUserAsync(int loanId, string accountId);
    }
}
