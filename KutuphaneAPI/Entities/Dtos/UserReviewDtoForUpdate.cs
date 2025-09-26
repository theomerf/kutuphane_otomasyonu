using System.ComponentModel.DataAnnotations;

namespace Entities.Dtos
{
    public record UserReviewDtoForUpdate : UserReviewDtoForCreation
    {
        [Required(ErrorMessage = "ID gereklidir.")]
        public int Id { get; init; }
    }
}
