using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Foot2site_V1.Migrations
{
    /// <inheritdoc />
    public partial class modifsdumodeledetaille : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transaction_Type_Operation_Id_TYPE_OPERATION",
                table: "Transaction");

            migrationBuilder.DropForeignKey(
                name: "FK_Transaction_User_Id_User",
                table: "Transaction");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_Id_TYPE_OPERATION",
                table: "Transaction");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_Id_User",
                table: "Transaction");

            migrationBuilder.AddColumn<int>(
                name: "TypeOperationId_Type_Operation",
                table: "Transaction",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UtilisateurId",
                table: "Transaction",
                type: "int",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Taille",
                columns: new[] { "Id", "taille" },
                values: new object[,]
                {
                    { 1, "XS" },
                    { 2, "S" },
                    { 3, "M" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_TypeOperationId_Type_Operation",
                table: "Transaction",
                column: "TypeOperationId_Type_Operation");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_UtilisateurId",
                table: "Transaction",
                column: "UtilisateurId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transaction_Type_Operation_TypeOperationId_Type_Operation",
                table: "Transaction",
                column: "TypeOperationId_Type_Operation",
                principalTable: "Type_Operation",
                principalColumn: "Id_Type_Operation");

            migrationBuilder.AddForeignKey(
                name: "FK_Transaction_User_UtilisateurId",
                table: "Transaction",
                column: "UtilisateurId",
                principalTable: "User",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transaction_Type_Operation_TypeOperationId_Type_Operation",
                table: "Transaction");

            migrationBuilder.DropForeignKey(
                name: "FK_Transaction_User_UtilisateurId",
                table: "Transaction");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_TypeOperationId_Type_Operation",
                table: "Transaction");

            migrationBuilder.DropIndex(
                name: "IX_Transaction_UtilisateurId",
                table: "Transaction");

            migrationBuilder.DeleteData(
                table: "Taille",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Taille",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Taille",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "TypeOperationId_Type_Operation",
                table: "Transaction");

            migrationBuilder.DropColumn(
                name: "UtilisateurId",
                table: "Transaction");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_Id_TYPE_OPERATION",
                table: "Transaction",
                column: "Id_TYPE_OPERATION");

            migrationBuilder.CreateIndex(
                name: "IX_Transaction_Id_User",
                table: "Transaction",
                column: "Id_User");

            migrationBuilder.AddForeignKey(
                name: "FK_Transaction_Type_Operation_Id_TYPE_OPERATION",
                table: "Transaction",
                column: "Id_TYPE_OPERATION",
                principalTable: "Type_Operation",
                principalColumn: "Id_Type_Operation",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transaction_User_Id_User",
                table: "Transaction",
                column: "Id_User",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
