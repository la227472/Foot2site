using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class Ajout_Commandes_Et_LigneCommandes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Credit",
                table: "User",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.CreateTable(
                name: "Commande",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    prixTotal = table.Column<double>(type: "float", nullable: false),
                    Paye = table.Column<bool>(type: "bit", nullable: false),
                    Id_UTILISATEUR = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Commande", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Commande_User_Id_UTILISATEUR",
                        column: x => x.Id_UTILISATEUR,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ligne_Commande",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    quantite = table.Column<int>(type: "int", nullable: false),
                    prixUnitaire = table.Column<double>(type: "float", nullable: false),
                    Id_COMMANDE = table.Column<int>(type: "int", nullable: false),
                    Id_STOCK_PRODUIT = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ligne_Commande", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Ligne_Commande_Commande_Id_COMMANDE",
                        column: x => x.Id_COMMANDE,
                        principalTable: "Commande",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ligne_Commande_Stock_produit_Id_STOCK_PRODUIT",
                        column: x => x.Id_STOCK_PRODUIT,
                        principalTable: "Stock_produit",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Commande_Id_UTILISATEUR",
                table: "Commande",
                column: "Id_UTILISATEUR");

            migrationBuilder.CreateIndex(
                name: "IX_Ligne_Commande_Id_COMMANDE",
                table: "Ligne_Commande",
                column: "Id_COMMANDE");

            migrationBuilder.CreateIndex(
                name: "IX_Ligne_Commande_Id_STOCK_PRODUIT",
                table: "Ligne_Commande",
                column: "Id_STOCK_PRODUIT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ligne_Commande");

            migrationBuilder.DropTable(
                name: "Commande");

            migrationBuilder.DropColumn(
                name: "Credit",
                table: "User");
        }
    }
}
