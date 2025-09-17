using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class ReservationConfig : IEntityTypeConfiguration<Reservation>
    {
        public void Configure(EntityTypeBuilder<Reservation> builder)
        {
            builder.HasKey(r => r.Id);
            builder.Property(r => r.AccountId)
                .IsRequired();
            builder.Property(r => r.SeatId)
                .IsRequired();
            builder.Property(r => r.TimeSlotId)
                .IsRequired();
            builder.Property(r => r.CreatedAt)
                .IsRequired();

            builder.HasOne(r => r.Account)
                .WithMany(a => a.Reservations)
                .HasForeignKey(r => r.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Seat)
                .WithMany(s => s.Reservations)
                .HasForeignKey(r => r.SeatId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.TimeSlot)
                .WithMany(ts => ts.Reservations)
                .HasForeignKey(r => r.TimeSlotId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
