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
                foreach (var error in result.Errors)
                {
                    ModelState.TryAddModelError(error.Code, error.Description);
                }
                return BadRequest(ModelState);
            }

            return CreatedAtAction(nameof(GetAccount), new {userName = accountDto.UserName});
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
