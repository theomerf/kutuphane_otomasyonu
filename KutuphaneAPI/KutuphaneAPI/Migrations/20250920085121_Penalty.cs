using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KutuphaneAPI.Migrations
{
    /// <inheritdoc />
    public partial class Penalty : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartLine_Loan_LoanId",
                table: "CartLine");

            migrationBuilder.DropIndex(
                name: "IX_CartLine_LoanId",
                table: "CartLine");

            migrationBuilder.DropColumn(
                name: "LoanId",
                table: "CartLine");

            migrationBuilder.CreateTable(
                name: "LoanLine",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LoanId = table.Column<int>(type: "int", nullable: false),
                    BookId = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoanLine", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoanLine_Books_BookId",
                        column: x => x.BookId,
                        principalTable: "Books",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanLine_Loan_LoanId",
                        column: x => x.LoanId,
                        principalTable: "Loan",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LoanLine_BookId",
                table: "LoanLine",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanLine_LoanId",
                table: "LoanLine",
                column: "LoanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LoanLine");

            migrationBuilder.AddColumn<int>(
                name: "LoanId",
                table: "CartLine",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_CartLine_LoanId",
                table: "CartLine",
                column: "LoanId");

            migrationBuilder.AddForeignKey(
                name: "FK_CartLine_Loan_LoanId",
                table: "CartLine",
                column: "LoanId",
                principalTable: "Loan",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
