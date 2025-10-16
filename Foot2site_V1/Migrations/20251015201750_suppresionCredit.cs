using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class suppresionCredit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Credit",
                table: "User");

            migrationBuilder.AddColumn<int>(
                name: "Id_Role",
                table: "User",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Role",
                columns: table => new
                {
                    Id_Role = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomRole = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Role", x => x.Id_Role);
                });

            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "Id_Role", "NomRole" },
                values: new object[,]
                {
                    { 1, "ADMIN" },
                    { 2, "CLINET" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_User_Id_Role",
                table: "User",
                column: "Id_Role");

            migrationBuilder.AddForeignKey(
                name: "FK_User_Role_Id_Role",
                table: "User",
                column: "Id_Role",
                principalTable: "Role",
                principalColumn: "Id_Role",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_User_Role_Id_Role",
                table: "User");

            migrationBuilder.DropTable(
                name: "Role");

            migrationBuilder.DropIndex(
                name: "IX_User_Id_Role",
                table: "User");

            migrationBuilder.DropColumn(
                name: "Id_Role",
                table: "User");

            migrationBuilder.AddColumn<double>(
                name: "Credit",
                table: "User",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }
    }
}
