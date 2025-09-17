using Entities.Dtos;
using Microsoft.AspNetCore.Mvc;
using Presentation.ActionFilters;
using Services.Contracts;

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
        public async Task<IActionResult> Login([FromBody] AccountForLoginDto accountDto)
        {
            if(!await _manager.AccountService.LoginUserAsync(accountDto))
            {
                return Unauthorized();
            }

            var tokenDto = await _manager.AccountService.CreateTokenAsync(populateExp: true, rememberMe: accountDto.RememberMe);

            return Ok(tokenDto);
        }

        [HttpPost("register")]
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> Register([FromBody] AccountForRegistrationDto accountDto)
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
        [ServiceFilter(typeof(ValidationFilterAttribute))]
        public async Task<IActionResult> Refresh([FromBody] TokenDto tokenDto)
        {
            var tokenDtoToReturn = await _manager.AccountService.RefreshTokenAsync(tokenDto);

            return Ok(tokenDtoToReturn);
        }

        [HttpGet("{userName}")]
        public async Task<IActionResult> GetAccount([FromRoute] String userName)
        {
            var user = await _manager.AccountService.GetUserByIdAsync(userName);

            return Ok(user);
        }
    }
}
