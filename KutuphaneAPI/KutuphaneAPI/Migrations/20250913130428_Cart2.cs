using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KutuphaneAPI.Migrations
{
    /// <inheritdoc />
    public partial class Cart2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BookImageUrl",
                table: "CartLine");

            migrationBuilder.DropColumn(
                name: "BookName",
                table: "CartLine");

            migrationBuilder.CreateIndex(
                name: "IX_CartLine_BookId",
                table: "CartLine",
                column: "BookId");

            migrationBuilder.AddForeignKey(
                name: "FK_CartLine_Books_BookId",
                table: "CartLine",
                column: "BookId",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartLine_Books_BookId",
                table: "CartLine");

            migrationBuilder.DropIndex(
                name: "IX_CartLine_BookId",
                table: "CartLine");

            migrationBuilder.AddColumn<string>(
                name: "BookImageUrl",
                table: "CartLine",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "BookName",
                table: "CartLine",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");
        }
    }
}
