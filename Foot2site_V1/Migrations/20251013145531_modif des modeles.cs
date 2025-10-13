using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class modifdesmodeles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Stock_produit",
                columns: new[] { "Id", "id_PRODUIT", "id_TAILLE", "quantite" },
                values: new object[] { 2, 1, 1, 20 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Stock_produit",
                keyColumn: "Id",
                keyValue: 2);
        }
    }
}
