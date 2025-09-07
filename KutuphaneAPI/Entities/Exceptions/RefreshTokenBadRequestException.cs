namespace Entities.Exceptions
{
    public class RefreshTokenBadRequestException : BadRequestException
    {
        public RefreshTokenBadRequestException() 
            : base($"Geçersiz istemci isteği. TokenDto geçersiz değerlere sahip.")
        {
        }
    }
}
