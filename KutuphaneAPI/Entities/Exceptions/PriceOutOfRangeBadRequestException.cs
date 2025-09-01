namespace Entities.Exceptions
{
    public class PriceOutOfRangeBadRequestException : BadRequestException
    {
        public PriceOutOfRangeBadRequestException() : base("Price is out of range. Please provide a valid price between 0 and 10000.")
        {
        }   

    }
        
        
}
