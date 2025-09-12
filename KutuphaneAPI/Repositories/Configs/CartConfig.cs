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
    public class CartConfig : IEntityTypeConfiguration<Cart>
    {
        public void Configure(EntityTypeBuilder<Cart> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.AccountId)
                .IsRequired();

            builder.HasOne(c => c.Account)
                .WithMany(a => a.Cart)
                .HasForeignKey(c => c.AccountId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(c => c.CartLines)
                .WithOne(cl => cl.Cart)
                .HasForeignKey(cl => cl.CartId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
