using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class AjoutProprieteNavigationNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Role",
                keyColumn: "Id_Role",
                keyValue: 2,
                column: "NomRole",
                value: "CLIENT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Role",
                keyColumn: "Id_Role",
                keyValue: 2,
                column: "NomRole",
                value: "CLINET");
        }
    }
}
