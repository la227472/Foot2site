using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class Ajoutdedonnéesinitiales : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Produit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    nom_produit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description_produit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    prix_unitaire_produit = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Produit", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Taille",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    taille = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Taille", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Firstname = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Adresse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Credit = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Stock_produit",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    quantite = table.Column<int>(type: "int", nullable: false),
                    id_PRODUIT = table.Column<int>(type: "int", nullable: false),
                    id_TAILLE = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stock_produit", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Stock_produit_Produit_id_PRODUIT",
                        column: x => x.id_PRODUIT,
                        principalTable: "Produit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Stock_produit_Taille_id_TAILLE",
                        column: x => x.id_TAILLE,
                        principalTable: "Taille",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Produit",
                columns: new[] { "Id", "description_produit", "nom_produit", "prix_unitaire_produit" },
                values: new object[] { 1, "le maillot du barcelone à domicile de 2017", "Maillot Barcelone 2017", 65.0 });

            migrationBuilder.InsertData(
                table: "Taille",
                columns: new[] { "Id", "taille" },
                values: new object[,]
                {
                    { 1, "XS" },
                    { 2, "S" },
                    { 3, "M" }
                });

            migrationBuilder.InsertData(
                table: "Stock_produit",
                columns: new[] { "Id", "id_PRODUIT", "id_TAILLE", "quantite" },
                values: new object[] { 1, 1, 2, 10 });

            migrationBuilder.CreateIndex(
                name: "IX_Stock_produit_id_PRODUIT",
                table: "Stock_produit",
                column: "id_PRODUIT");

            migrationBuilder.CreateIndex(
                name: "IX_Stock_produit_id_TAILLE",
                table: "Stock_produit",
                column: "id_TAILLE");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Stock_produit");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Produit");

            migrationBuilder.DropTable(
                name: "Taille");
        }
    }
}
