namespace Entities.Dtos
{
    public record AccountDtoForFavorites
    {
        public ICollection<int>? FavoriteBookIds { get; set; }
        }
}
