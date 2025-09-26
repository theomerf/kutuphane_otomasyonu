namespace Entities.Exceptions
{
    public class UserReviewNotFoundException : NotFoundException
    {
        public UserReviewNotFoundException(int userReviewId)
            : base($"{userReviewId} id'sine sahip kullanıcı değerlendirmesi bulunamadı.")
        {
        }
    }
}
