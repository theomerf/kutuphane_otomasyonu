using Microsoft.AspNetCore.Http;

namespace Entities.Dtos
{
    public record AccountDtoForAvatarUpdate
    {
        public String? Id { get; set; }
        public IFormFile NewImage { get; set; } = null!;
    }
}
