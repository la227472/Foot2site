using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class Modif : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Credit",
                table: "User");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Credit",
                table: "User",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
