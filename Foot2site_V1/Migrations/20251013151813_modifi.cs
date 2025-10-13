using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class modifi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Produit",
                columns: new[] { "Id", "description_produit", "nom_produit", "prix_unitaire_produit" },
                values: new object[] { 2, "le maillot du Real Madrid à l'extérieur de 2014", "Maillot Real Madrid 2014", 80.0 });

            migrationBuilder.InsertData(
                table: "Taille",
                columns: new[] { "Id", "taille" },
                values: new object[,]
                {
                    { 4, "L" },
                    { 5, "XL" },
                    { 6, "XLL" }
                });

            migrationBuilder.InsertData(
                table: "Stock_produit",
                columns: new[] { "Id", "id_PRODUIT", "id_TAILLE", "quantite" },
                values: new object[] { 3, 2, 4, 20 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Stock_produit",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Taille",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Taille",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Produit",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Taille",
                keyColumn: "Id",
                keyValue: 4);
        }
    }
}
