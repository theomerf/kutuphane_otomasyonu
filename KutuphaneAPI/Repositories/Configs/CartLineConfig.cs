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
    public class CartLineConfig : IEntityTypeConfiguration<CartLine>
    {
        public void Configure(EntityTypeBuilder<CartLine> builder)
        {
            builder.HasKey(cl => cl.Id);
            builder.Property(cl => cl.BookId)
                .IsRequired();
            builder.Property(cl => cl.CartId)
                .IsRequired();

            builder.HasOne(cl => cl.Cart)
                .WithMany(c => c.CartLines)
                .HasForeignKey(cl => cl.CartId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(cl => cl.Book)
                .WithMany(b => b.CartLines)
                .HasForeignKey(cl => cl.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
