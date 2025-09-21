using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class LoanLineConfig : IEntityTypeConfiguration<LoanLine>
    {
        public void Configure(EntityTypeBuilder<LoanLine> builder)
        {
            builder.HasKey(ll => ll.Id);
            builder.Property(ll => ll.LoanId)
                .IsRequired();
            builder.Property(ll => ll.BookId)
                .IsRequired();
            builder.Property(ll => ll.Quantity)
                .IsRequired();

            builder.HasOne(ll => ll.Loan)
                .WithMany(l => l.LoanLines)
                .HasForeignKey(ll => ll.LoanId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ll => ll.Book)
                .WithMany(b => b.LoanLines)
                .HasForeignKey(ll => ll.BookId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
