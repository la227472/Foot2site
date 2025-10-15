using Foot2site_V1.Modele;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualStudio.Web.CodeGenerators.Mvc.Templates.Blazor;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Foot2site_V1.Data
{
    public class Foot2site_V1Context : DbContext
    {
        public Foot2site_V1Context (DbContextOptions<Foot2site_V1Context> options)
            : base(options)
        {
        }

        public DbSet<Foot2site_V1.Modele.Taille> Taille { get; set; } = default!;
        public DbSet<Foot2site_V1.Modele.Stock_produit> Stock_produit { get; set; } = default!;
        public DbSet<Foot2site_V1.Modele.User> User { get; set; } = default!;
        public DbSet<Foot2site_V1.Modele.Produit> Produit { get; set; } = default!;
        public DbSet<Foot2site_V1.Modele.Transaction> Transaction { get; set; } = default!;
        public DbSet<Foot2site_V1.Modele.Type_Operation> Type_Operation { get; set; } = default!;

        public DbSet<Foot2site_V1.Modele.Commande> Commande { get; set; } = default!;
        public DbSet<Foot2site_V1.Modele.Ligne_Commande> Ligne_Commande { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Produit>()
                .HasMany(produits => produits.stocks)
                .WithOne(stock => stock.produit)
                .HasForeignKey(stock => stock.id_PRODUIT); // Spécifier la clé étrangère

            modelBuilder.Entity<Stock_produit>()
                .HasOne(stock => stock.taille)
                .WithMany(tailles => tailles.Stock_Produits_List)
                .HasForeignKey(stock => stock.id_TAILLE); // Spécifier la clé étrangère


            // Relation Commande -> Utilisateur (Many-to-One)
            
            modelBuilder.Entity<Commande>()
                .HasOne(commande => commande.utilisateur)
                .WithMany(utilisateur => utilisateur.commandes)
                .HasForeignKey(commande => commande.Id_UTILISATEUR);

            // Relation Commande -> LigneCommande
            modelBuilder.Entity<Commande>()
                .HasMany(commande => commande.lignes_Commande)
                .WithOne(ligne => ligne.commande)
                .HasForeignKey(ligne => ligne.Id_COMMANDE);

            // Relation LigneCommande -> StockProduit
            modelBuilder.Entity<Ligne_Commande>()
                .HasOne(ligne => ligne.stock_Produit)
                .WithMany(stock => stock.lignesCommande)
                .HasForeignKey(ligne => ligne.Id_STOCK_PRODUIT);    

            modelBuilder.Entity<Transaction>()
              .HasOne(t => t.Utilisateur)
              .WithMany(u => u.Transactions)
              .HasForeignKey(t => t.Id_User);

            modelBuilder.Entity<Transaction>()
            .Property(t => t.Montant_operation)
            .HasColumnType("decimal(10,2)");


            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.TypeOperation)
                .WithMany(to => to.Transactions)
                .HasForeignKey(t => t.Id_TYPE_OPERATION);


            /*modelBuilder.Entity<Enseignant>()
                        .HasMany(e => e.cours)
                        .WithOne(c => c.Enseignant);

            modelBuilder.Entity<Etudiant>()
                        .HasMany(e => e.cours)
                        .WithMany(c => c.etudiants);*/


            // Ajouter des produits
            /*modelBuilder.Entity<Produit>().HasData(
                new Produit 
                { 
                    Id = 1,
                    nom_produit = "Maillot Barcelone 2017",
                    description_produit = "le maillot du barcelone à domicile de 2017", 
                    prix_unitaire_produit = 65.00
                }

                new Produit
                {
                    Id = 2,
                    nom_produit = "Maillot Real Madrid 2014",
                    description_produit = "le maillot du Real Madrid à l'extérieur de 2014",
                    prix_unitaire_produit = 80.00
                }

            );*/

            // Ajouter des tailles
            modelBuilder.Entity<Taille>().HasData(
                new Taille { Id = 1, taille = "XS" },
                new Taille { Id = 2, taille = "S" },
                new Taille { Id = 3, taille = "M" }
                /*new Taille { Id = 4, taille = "L" },
                new Taille { Id = 5, taille = "XL" },
                new Taille { Id = 6, taille = "XLL" }*/
            );

            // Ajouter des stocks
           /* modelBuilder.Entity<Stock_produit>().HasData(
                new Stock_produit
                {
                    Id = 1,
                    quantite = 10,
                    id_PRODUIT = 1,  // Maillot Barcelone 
                    id_TAILLE = 2  // Taille S

                },

                new Stock_produit
                {
                    Id = 2,
                    quantite = 20,
                    id_PRODUIT = 1,  // Maillot Barcelone 
                    id_TAILLE = 1  // Taille XS
                },

                new Stock_produit
                {
                    Id = 3,
                    quantite = 20,
                    id_PRODUIT = 2,  // Maillot Real Madrid 
                    id_TAILLE = 4  // Taille L 
                }
            );*/

            modelBuilder.Entity<Type_Operation>().HasData(
           new Type_Operation { Id_Type_Operation = 1, Nom_Type_Operation = "RECHARGE" },
           new Type_Operation { Id_Type_Operation = 2, Nom_Type_Operation = "DEBIT" }
           );
        }
       
      
      
    }
}
