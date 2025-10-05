using Entities.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;
using System.Security.Claims;

namespace Presentation.Controllers
{
    [ServiceFilter(typeof(LogFilterAttribute))]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly IServiceManager _manager;

        public AccountController(IServiceManager manager)
        {
            _manager = manager;
        }

        [HttpPost("login")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> Login([FromBody] AccountDtoForLogin accountDto)
        {
            if (!await _manager.AccountService.LoginUserAsync(accountDto))
            {
                return Unauthorized();
            }

            var tokenDto = await _manager.AccountService.CreateTokenAsync(populateExp: true, rememberMe: accountDto.RememberMe);

            return Ok(tokenDto);
        }

        [HttpPost("register")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> Register([FromBody] AccountDtoForRegistration accountDto)
        {
            var result = await _manager.AccountService.RegisterUserAsync(accountDto);

            if (!result.Succeeded)
            {
                var errors = new Dictionary<string, string[]>();

                foreach (var error in result.Errors)
                {
                    var field = error.Code switch
                    {
                        "DuplicateUserName" => "UserName",
                        "DuplicateEmail" => "Email",
                        "PasswordTooShort" => "Password",
                        "PasswordRequiresDigit" => "Password",
                        "PasswordRequiresUpper" => "Password",
                        "PasswordRequiresLower" => "Password",
                        "InvalidUserName" => "UserName",
                        "InvalidEmail" => "Email",
                        _ => "General"
                    };

                    if (!errors.ContainsKey(field))
                        errors[field] = new string[0];

                    errors[field] = errors[field].Concat(new[] { error.Description }).ToArray();
                }

                return UnprocessableEntity(new
                {
                    message = "Kayıt işlemi başarısız.",
                    errors = errors
                });
            }

            return CreatedAtAction(nameof(GetAccount), new { userName = accountDto.UserName }, new
            {
                message = "Kayıt başarılı."
            });
        }

        [HttpPost("refresh")]
        [Authorize]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> Refresh([FromBody] TokenDto tokenDto)
        {
            var tokenDtoToReturn = await _manager.AccountService.RefreshTokenAsync(tokenDto);

            return Ok(tokenDtoToReturn);
        }

        [Authorize]
        [HttpGet("details")]
        public async Task<IActionResult> GetAccount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _manager.AccountService.GetAccountByIdAsync(userId!);

            return Ok(user);
        }

        [Authorize]
        [HttpPatch("update")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateAccount([FromBody] AccountDtoForUpdate accountDto)
        {
            if (accountDto.Id != User.FindFirstValue(ClaimTypes.NameIdentifier))
            {
                return Forbid();
            }
            await _manager.AccountService.UpdateAccountAsync(accountDto);
            return NoContent();
        }

        [Authorize]
        [HttpPatch("update-avatar")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> UpdateAvatar([FromForm] AccountDtoForAvatarUpdate accountDto)
        {
            var accountId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            accountDto.Id = accountId!;

            await _manager.AccountService.UpdateAvatarAsync(accountDto);
            return NoContent();
        }
    }
}
