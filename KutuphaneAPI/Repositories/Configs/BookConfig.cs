using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class BookConfig : IEntityTypeConfiguration<Book>
    {
        public void Configure(EntityTypeBuilder<Book> builder)
        {
            builder.HasKey(b => b.Id);
            builder.Property(b => b.Title)
                .IsRequired()
                .HasMaxLength(200);
            builder.Property(b => b.ISBN)
                .IsRequired()
                .HasMaxLength(13);
            builder.Property(b => b.Location)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasMany(b => b.Authors)
                .WithMany(a => a.Books)
                .UsingEntity(j => j.ToTable("BookAuthors"));

            builder.HasMany(b => b.Categories)
                .WithMany(c => c.Books)
                .UsingEntity(j => j.ToTable("BookCategories"));

            builder.HasMany(b => b.Tags)
                .WithMany(t => t.Books)
                .UsingEntity(j => j.ToTable("BookTags"));

            builder.HasMany(b => b.Images)
                .WithOne(i => i.Book)
                .HasForeignKey(i => i.BookId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
