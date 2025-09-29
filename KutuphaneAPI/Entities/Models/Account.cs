using Microsoft.AspNetCore.Identity;

namespace Entities.Models
{
    public class Account : IdentityUser
    {
        public String? AvatarUrl { get; set; } = "avatars/default.png";
        public String? FirstName { get; set; }
        public String? LastName { get; set; }
        public DateTime MembershipDate { get; set; } = DateTime.UtcNow;
        public DateOnly? BirthDate { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public String? RefreshToken { get; set; }
        public DateTime RefreshTokenExpiryTime { get; set; }
        public int CartId { get; set; }
        public Cart? Cart { get; set; }
        public ICollection<UserReview>? Reviews { get; set; }
        public ICollection<Reservation>? Reservations { get; set; }
        public ICollection<Loan>? Loans { get; set; }
        public ICollection<Penalty>? Penalties { get; set; }
        public ICollection<Notification>? Notifications { get; set; }
    }
}
