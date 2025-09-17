using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class SeatConfig : IEntityTypeConfiguration<Seat>
    {
        public void Configure(EntityTypeBuilder<Seat> builder)
        {
            builder.HasKey(s => s.Id);
            builder.Property(s => s.SeatNumber).IsRequired();
            builder.Property(s => s.Floor).IsRequired();
            builder.Property(s => s.Location)
                .IsRequired()
                .HasMaxLength(200);

            builder.HasMany(s => s.Reservations)
                   .WithOne(r => r.Seat)
                   .HasForeignKey(r => r.SeatId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
