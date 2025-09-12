using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class AuthorConfig : IEntityTypeConfiguration<Author>
    {
        public void Configure(EntityTypeBuilder<Author> builder)
        {
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasMany(a => a.Books)
                .WithMany(b => b.Authors)
                .UsingEntity(j => j.ToTable("BookAuthors"));
        }
    }
}
