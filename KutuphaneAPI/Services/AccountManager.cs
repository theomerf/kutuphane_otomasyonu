using AutoMapper;
using Entities.Dtos;
using Entities.Exceptions;
using Entities.Models;
using Entities.RequestFeatures;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Repositories.Contracts;
using Services.Contracts;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Services
{
    public class AccountManager : IAccountService
    {
        private readonly UserManager<Account> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IRepositoryManager _manager;
        private readonly IMapper _mapper;
        private readonly ILoggerService _logger;
        private readonly IConfiguration _configuration;

        private Account? _account;

        public AccountManager(UserManager<Account> userManager, RoleManager<IdentityRole> roleManager, ILoggerService logger, IMapper mapper, IConfiguration configuration, IRepositoryManager manager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
            _mapper = mapper;
            _configuration = configuration;
            _manager = manager;
        }

        public async Task<IdentityResult> RegisterUserAsync(AccountDtoForRegistration accountDto)
        {
            var user = _mapper.Map<Account>(accountDto);
            accountDto.Roles?.Add("User");

            if(accountDto.Roles != null && accountDto.Password != null)
            {
                var result = await _userManager.CreateAsync(user, accountDto.Password);

                if (result.Succeeded)
                {
                    await _userManager.AddToRolesAsync(user, accountDto.Roles);
                }

                return result;
            }

            return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı oluşturma başarısız." });
        }

        public async Task<bool> LoginUserAsync(AccountDtoForLogin accountDto)
        {
            if(accountDto.UserName != null && accountDto.Password != null)
            {
                _account = await _userManager.FindByNameAsync(accountDto.UserName);
                var result = (_account != null && await _userManager.CheckPasswordAsync(_account, accountDto.Password));

                return result;
            }
            return false;
        }

        private async Task<Account> GetUserByIdForServiceAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            if (user == null)
            {
                throw new AccountNotFoundException(id);
            }

            return user;
        }

        public async Task<AccountDto> GetAccountByIdAsync(string userName)
        {
            var user = await GetUserByIdForServiceAsync(userName);
            var userDto = _mapper.Map<AccountDto>(user);

            var roles = await _userManager.GetRolesAsync(user);
            userDto.Roles = roles.ToList();

            return userDto;
        }

        public async Task<TokenDto> CreateTokenAsync(bool populateExp, bool rememberMe)
        {
            var signinCredentials = GetSigningCredentials();
            var claims = await GetClaimsAsync();
            var tokenOptions = GenerateTokenOptions(signinCredentials, claims);

            var refreshToken = GenerateRefreshToken();

            if (_account != null)
            {
                _account.RefreshToken = refreshToken;

                if (populateExp)
                {
                    if (rememberMe) 
                    {
                        _account.RefreshTokenExpiryTime = DateTime.Now.AddDays(15);
                    }
                    else
                    {
                        _account.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
                    }
                }

                await _userManager.UpdateAsync(_account);
            }

            
            var accessToken = new JwtSecurityTokenHandler().WriteToken(tokenOptions);
            return new TokenDto()
            {
                UserName = _account?.UserName,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }

        private SigningCredentials GetSigningCredentials()
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.UTF8.GetBytes(jwtSettings["secretKey"]!);
            var secret = new SymmetricSecurityKey(key);

            return new SigningCredentials(secret, SecurityAlgorithms.HmacSha256);
        }

        private async Task<List<Claim>> GetClaimsAsync()
        {
            var claims = new List<Claim>()
            {
                new Claim(ClaimTypes.NameIdentifier, _account?.Id!),
                new Claim(ClaimTypes.Name, _account?.UserName!)
            };

            var roles = await _userManager.GetRolesAsync(_account!);

            foreach (var role in roles){
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            return claims;
        }

        private JwtSecurityToken GenerateTokenOptions(SigningCredentials signinCredentials, List<Claim> claims)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");

            var tokenOptions = new JwtSecurityToken(
                issuer: jwtSettings["validIssuer"],
                audience: jwtSettings["validAudience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(Convert.ToDouble(jwtSettings["expires"])),
                signingCredentials: signinCredentials);

            return tokenOptions;
        }

        private String GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);
                return Convert.ToBase64String(randomNumber);
            }
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["secretKey"];

            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["validIssuer"],
                ValidAudience = jwtSettings["validAudience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken securityToken;

            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out securityToken);

            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if(jwtSecurityToken is null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new SecurityTokenException("Geçersiz token");
            }

            return principal;
        }

        public async Task<TokenDto> RefreshTokenAsync(TokenDto tokenDto)
        {
            var principal = GetPrincipalFromExpiredToken(tokenDto.AccessToken!);

            var account = await _userManager.FindByNameAsync(principal.Identity?.Name!);

            if(account is null || account.RefreshToken != tokenDto.RefreshToken || account.RefreshTokenExpiryTime <= DateTime.Now)
            {
                throw new RefreshTokenBadRequestException();
            }

            _account = account;
            return await CreateTokenAsync(populateExp: false, rememberMe: false);
        }

        public async Task<IdentityResult> CreateAccountAsync(AccountDtoForCreation accountDto)
        {
            var account = _mapper.Map<Account>(accountDto);
            if (accountDto.Roles != null && accountDto.Password != null)
            {
                var result = await _userManager.CreateAsync(account, accountDto.Password);

                if (result.Succeeded)
                {
                    await _userManager.AddToRolesAsync(account, accountDto.Roles);
                }

                return result;
            }

            return IdentityResult.Failed(new IdentityError { Description = "Kullanıcı oluşturma başarısız." });
        }

        public async Task<IdentityResult> ResetPasswordAsync(AccountDtoForPassword accountDto)
        {
            var account = await GetUserByIdForServiceAsync(accountDto.Id);

            account.PasswordHash = _userManager.PasswordHasher.HashPassword(account, accountDto.Password);
            var result = await _userManager.UpdateAsync(account);

            return result;
        }

        public async Task<IdentityResult> UpdateAccountAsync(AccountDtoForUpdate accountDto)
        {
            var accountExists = await GetUserByIdForServiceAsync(accountDto.Id!);
            _mapper.Map(accountDto, accountExists);

            var result = await _userManager.UpdateAsync(accountExists);
            var accountRoles = await _userManager.GetRolesAsync(accountExists);

            var toAdd = accountDto.Roles.Except(accountRoles);
            var toRemove = accountRoles.Except(accountDto.Roles);

            if (toAdd.Any())
                await _userManager.AddToRolesAsync(accountExists, toAdd);

            if (toRemove.Any())
                await _userManager.RemoveFromRolesAsync(accountExists, toRemove);

            return result;
        }

        public async Task<IdentityResult> DeleteAccountAsync(string id)
        {
            var account = await GetUserByIdForServiceAsync(id);
            var result = await _userManager.DeleteAsync(account!);

            return result;
        }

        public async Task<(IEnumerable<AccountDto> accounts, MetaData metaData)> GetAllAccountsAsync(AdminRequestParameters p, bool trackChanges)
        {
            var result = await _manager.Account.GetAllAccountsAsync(p, trackChanges);
            var accountsDto = _mapper.Map<IEnumerable<AccountDto>>(result.accounts);

            var pagedAccounts = PagedList<AccountDto>.ToPagedList(accountsDto, p.PageNumber, p.PageSize, result.count);

            return (pagedAccounts, pagedAccounts.MetaData);
        }

        public async Task<int> GetAllAccountsCountAsync() => await _manager.Account.GetAllAccountsCountAsync();

        public IEnumerable<string> GetAllRoles()
        {
            var roles = _roleManager.Roles.Select(r => r.Name!).ToList();
            return roles;
        }
    }
}
