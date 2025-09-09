using Microsoft.AspNetCore.Identity;

namespace Entities.Models
{
    public class Account : IdentityUser
    {
        public String? AvatarUrl { get; set; } = "avatars/default.png";
        public String? FirstName { get; set; }
        public String? LastName { get; set; }
        public DateTime MembershipDate { get; set; } = DateTime.UtcNow;
        public DateTime? BirthDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public String? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
        public ICollection<Review>? Reviews { get; set; }
    }
}
