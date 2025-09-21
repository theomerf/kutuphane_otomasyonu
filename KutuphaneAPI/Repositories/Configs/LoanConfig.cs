using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class LoanConfig : IEntityTypeConfiguration<Loan>
    {
        public void Configure(EntityTypeBuilder<Loan> builder)
        {
            builder.HasKey(l => l.Id);
            builder.Property(l => l.AccountId)
                .IsRequired();
            builder.Property(l => l.LoanDate)
                .IsRequired();
            builder.Property(l => l.DueDate)
                .IsRequired();
            builder.Property(l => l.Status)
                .IsRequired();
            builder.Property(l => l.FineAmount)
                .HasColumnType("decimal(18,2)");

            builder.HasOne(l => l.Account)
                .WithMany(a => a.Loans)
                .HasForeignKey(l => l.AccountId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(l => l.LoanLines)
                .WithOne(cl => cl.Loan)
                .HasForeignKey(cl => cl.LoanId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
