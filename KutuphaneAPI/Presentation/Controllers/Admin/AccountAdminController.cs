using Entities.Dtos;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Text.Json;

namespace Presentation.Controllers.Admin
{
    [Authorize(Roles = "Admin")]
    [ApiController]
    [Route("api/admin/accounts")]
    public class AccountAdminController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public AccountAdminController(IServiceManager manager)
        {
            _manager = manager;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllAccounts([FromQuery] AdminRequestParameters p)
        {
            var pagedAccounts = await _manager.AccountService.GetAllAccountsAsync(p, false);
            Response.Headers.Add("X-Pagination", JsonSerializer.Serialize(pagedAccounts.metaData));

            return Ok(pagedAccounts.accounts);
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetAllAccountsCount()
        {
            var count = await _manager.AccountService.GetAllAccountsCountAsync();

            return Ok(count);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAccountById([FromRoute] String id)
        {
            var account = await _manager.AccountService.GetAccountByIdAsync(id);

            return Ok(account);
        }

        [HttpPost("create")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> CreateAccount([FromBody] AccountDtoForCreation accountDto)
        {
            var result = await _manager.AccountService.CreateAccountAsync(accountDto);

            return Ok(result);
        }

        [HttpPut("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateAccount([FromBody] AccountDtoForUpdate accountDto)
        {
            var result = await _manager.AccountService.UpdateAccountAsync(accountDto);

            return Ok(result);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAccount([FromRoute] String id)
        {
            await _manager.AccountService.DeleteAccountAsync(id);

            return NoContent();
        }

        [HttpPost("reset-password")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> ResetPassword([FromBody] AccountDtoForPassword accountDto)
        {
            var result = await _manager.AccountService.ResetPasswordAsync(accountDto);

            return Ok(result);
        }

        [HttpGet("roles")]
        public IActionResult GetAllRoles()
        {
            var roles = _manager.AccountService.GetAllRoles();

            return Ok(roles);
        }
    }
}
