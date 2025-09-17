using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KutuphaneAPI.Migrations
{
    /// <inheritdoc />
    public partial class Reserv : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Seat_TimeSlot_TimeSlotId",
                table: "Seat");

            migrationBuilder.DropIndex(
                name: "IX_Seat_TimeSlotId",
                table: "Seat");

            migrationBuilder.DropColumn(
                name: "IsAvailable",
                table: "Seat");

            migrationBuilder.DropColumn(
                name: "TimeSlotId",
                table: "Seat");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Reservation");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Reservation");

            migrationBuilder.AddColumn<int>(
                name: "TimeSlotId",
                table: "Reservation",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Reservation_TimeSlotId",
                table: "Reservation",
                column: "TimeSlotId");

            migrationBuilder.AddForeignKey(
                name: "FK_Reservation_TimeSlot_TimeSlotId",
                table: "Reservation",
                column: "TimeSlotId",
                principalTable: "TimeSlot",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reservation_TimeSlot_TimeSlotId",
                table: "Reservation");

            migrationBuilder.DropIndex(
                name: "IX_Reservation_TimeSlotId",
                table: "Reservation");

            migrationBuilder.DropColumn(
                name: "TimeSlotId",
                table: "Reservation");

            migrationBuilder.AddColumn<bool>(
                name: "IsAvailable",
                table: "Seat",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TimeSlotId",
                table: "Seat",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "EndTime",
                table: "Reservation",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "StartTime",
                table: "Reservation",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Seat_TimeSlotId",
                table: "Seat",
                column: "TimeSlotId");

            migrationBuilder.AddForeignKey(
                name: "FK_Seat_TimeSlot_TimeSlotId",
                table: "Seat",
                column: "TimeSlotId",
                principalTable: "TimeSlot",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
