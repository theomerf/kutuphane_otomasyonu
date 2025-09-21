using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class PenaltyConfig : IEntityTypeConfiguration<Penalty>
    {
        public void Configure(EntityTypeBuilder<Penalty> builder)
        {
            builder.HasKey(p => p.Id);
            builder.Property(p => p.AccountId)
                .IsRequired();
            builder.Property(p => p.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");
            builder.Property(p => p.Reason)
                .IsRequired()
                .HasMaxLength(300);
            builder.Property(p => p.IssuedDate)
                .IsRequired();
            builder.Property(p => p.IsPaid)
                .IsRequired()
                .HasDefaultValue(false);

            builder.HasOne(p => p.Account)
                .WithMany(a => a.Penalties)
                .HasForeignKey(p => p.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
