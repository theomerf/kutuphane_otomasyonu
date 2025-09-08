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
    public class BookImageConfig : IEntityTypeConfiguration<BookImage>
    {
        public void Configure(EntityTypeBuilder<BookImage> builder)
        {
            builder.HasKey(bi => bi.Id);
            builder.Property(bi => bi.ImageUrl)
                .IsRequired()
                .HasMaxLength(500);

            builder.HasOne(bi => bi.Book)
                .WithMany(b => b.Images)
                .HasForeignKey(bi => bi.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
