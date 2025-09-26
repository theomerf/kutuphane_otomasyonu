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
    public class UserReviewConfig : IEntityTypeConfiguration<UserReview>
    {
        public void Configure(EntityTypeBuilder<UserReview> builder)
        {
            builder.HasKey(ur => ur.Id);
            builder.Property(ur => ur.Rating)
                .IsRequired();
            builder.Property(ur => ur.Comment)
                .HasMaxLength(1000);
            builder.Property(ur => ur.CreatedAt)
                .IsRequired();
            builder.Property(ur => ur.AccountId)
                .IsRequired();

            builder.HasOne(ur => ur.Account)
                .WithMany(a => a.Reviews)
                .HasForeignKey(ur => ur.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ur => ur.Book)
                .WithMany(b => b.Reviews)
                .HasForeignKey(ur => ur.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
