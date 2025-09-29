using Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Repositories.Configs
{
    public class NotificationConfig : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.HasKey(n => n.Id);
            builder.Property(n => n.Title)
                .IsRequired()
                .HasMaxLength(100);
            builder.Property(n => n.Message)
                .IsRequired()
                .HasMaxLength(500);
            builder.Property(n => n.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            builder.Property(n => n.IsRead)
                .IsRequired()
                .HasDefaultValue(false);
            builder.Property(n => n.Type)
                .IsRequired()
                .HasDefaultValue(NotificationType.Info);

            builder.HasOne(n => n.Account)
                .WithMany(a => a.Notifications)
                .HasForeignKey(n => n.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
