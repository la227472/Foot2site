using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class InitialFonctionnel : Migration
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
                name: "Type_Operation",
                columns: table => new
                {
                    Id_Type_Operation = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nom_Type_Operation = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Type_Operation", x => x.Id_Type_Operation);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    Id_User = table.Column<int>(type: "int", nullable: false)
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
                    table.PrimaryKey("PK_User", x => x.Id_User);
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
                        principalColumn: "Id_User",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Transaction",
                columns: table => new
                {
                    Id_Transaction = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description_transaction = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Montant_operation = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Id_User = table.Column<int>(type: "int", nullable: false),
                    Id_TYPE_OPERATION = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transaction", x => x.Id_Transaction);
                    table.ForeignKey(
                        name: "FK_Transaction_Type_Operation_Id_TYPE_OPERATION",
                        column: x => x.Id_TYPE_OPERATION,
                        principalTable: "Type_Operation",
                        principalColumn: "Id_Type_Operation",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Transaction_User_Id_User",
                        column: x => x.Id_User,
                        principalTable: "User",
                        principalColumn: "Id_User",
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

            migrationBuilder.InsertData(
                table: "Taille",
                columns: new[] { "Id", "taille" },
                values: new object[,]
                {
                    { 1, "XS" },
                    { 2, "S" },
                    { 3, "M" },
                    { 4, "L" },
                    { 5, "XL" },
                    { 6, "XXL" }
                });

            migrationBuilder.InsertData(
                table: "Type_Operation",
                columns: new[] { "Id_Type_Operation", "Nom_Type_Operation" },
                values: new object[,]
                {
                    { 1, "RECHARGE" },
                    { 2, "DEBIT" }
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

            migrationBuilder.CreateIndex(
                name: "IX_Stock_produit_id_PRODUIT",
                table: "Stock_produit",
                column: "id_PRODUIT");

            migrationBuilder.CreateIndex(
                name: "IX_Stock_produit_id_TAILLE",
                table: "Stock_produit",
                column: "id_TAILLE");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_Id_TYPE_OPERATION",
                table: "Transaction",
                column: "Id_TYPE_OPERATION");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_Id_User",
                table: "Transaction",
                column: "Id_User");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Ligne_Commande");

            migrationBuilder.DropTable(
                name: "Transaction");

            migrationBuilder.DropTable(
                name: "Commande");

            migrationBuilder.DropTable(
                name: "Stock_produit");

            migrationBuilder.DropTable(
                name: "Type_Operation");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Produit");

            migrationBuilder.DropTable(
                name: "Taille");
        }
    }
}
