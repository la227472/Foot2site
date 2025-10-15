using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Foot2site_V1.Modele;

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

        public DbSet<Foot2site_V1.Modele.Commande> Commande { get; set; } = default!;

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

        
           // Configuration de la table COMMANDE
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


            /*modelBuilder.Entity<Enseignant>()
                        .HasMany(e => e.cours)
                        .WithOne(c => c.Enseignant);

            modelBuilder.Entity<Etudiant>()
                        .HasMany(e => e.cours)
                        .WithMany(c => c.etudiants);*/


            // Ajouter des produits
            modelBuilder.Entity<Produit>().HasData(
                new Produit 
                { 
                    Id = 1,
                    nom_produit = "Maillot Barcelone 2017",
                    description_produit = "le maillot du barcelone à domicile de 2017", 
                    prix_unitaire_produit = 65.00
                }

            );

            // Ajouter des tailles
            modelBuilder.Entity<Taille>().HasData(
                new Taille { Id = 1, taille = "XS" },
                new Taille { Id = 2, taille = "S" },
                new Taille { Id = 3, taille = "M" }
            );

            // Ajouter des stocks
            modelBuilder.Entity<Stock_produit>().HasData(
                new Stock_produit
                {
                    Id = 1,
                    quantite = 10,
                    id_PRODUIT = 1,  // Maillot Barcelone 
                    id_TAILLE = 2,  // Taille S

                }
            );
        }
      
      
    }
}
