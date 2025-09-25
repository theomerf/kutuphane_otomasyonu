namespace Entities.Dtos
{
    public class AccountDto
    {
        public String? Id { get; init; }
        public String? UserName { get; init; }
        public String? AvatarUrl { get; init; }
        public String? FirstName { get; init; }
        public String? LastName { get; init; }
        public String? PhoneNumber { get; init; }
        public String? Email { get; init; }
        public DateTime MembershipDate { get; init; }
        public DateOnly? BirthDate { get; init; }
        public DateTime? LastLoginDate { get; init; }
        public ICollection<String>? Roles { get; set; }
    }
}
