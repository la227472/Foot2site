using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class AjoutTablesTransactionEtTypeOperationAvecRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Stock_produit",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Taille",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Taille",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Produit",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Taille",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DropColumn(
                name: "Credit",
                table: "User");

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
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                name: "Transaction");

            migrationBuilder.DropTable(
                name: "Type_Operation");

            migrationBuilder.AddColumn<double>(
                name: "Credit",
                table: "User",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

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
        }
    }
}
