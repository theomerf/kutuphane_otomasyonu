using Entities.Dtos;
using Entities.Models;

namespace Services.Contracts
{
    public interface ILoanService
    {
        Task<IEnumerable<LoanDto>> GetAllLoansAsync(bool trackChanges);
        Task<LoanDto> GetOneLoanByIdAsync(int id, bool trackChanges);
        Task<IEnumerable<LoanDto>> GetLoansByAccountIdAsync(string accountId, bool trackChanges);
        Task CreateLoanAsync(LoanDto loanDto);
        Task UpdateLoanAsync(LoanDto loanDto);
        Task DeleteLoanAsync(int loanId);
    }
}
