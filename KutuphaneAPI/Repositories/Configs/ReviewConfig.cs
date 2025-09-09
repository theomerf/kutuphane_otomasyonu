using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Configs
{
    public class ReviewConfig : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            builder.HasKey(r => r.Id);
            builder.Property(r => r.Rating)
                .IsRequired();

            builder.HasOne(r => r.Book)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Account)
                .WithMany(a => a.Reviews)
                .HasForeignKey(r => r.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
