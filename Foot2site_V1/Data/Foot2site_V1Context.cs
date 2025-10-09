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


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Produit>()
                .HasMany(produits => produits.stocks)
                .WithOne(stock => stock.produit);

           /* modelBuilder.Entity<Cours>()
                        .HasOne(cours => cours.Enseignant)
                        .WithMany(e => e.cours);

            modelBuilder.Entity<Enseignant>()
                        .HasMany(e => e.cours)
                        .WithOne(c => c.Enseignant);

            modelBuilder.Entity<Etudiant>()
                        .HasMany(e => e.cours)
                        .WithMany(c => c.etudiants);

            modelBuilder.Entity<Enseignant>().HasData(
                new Enseignant { Id = 1, Nom = "Brunquers", Prenom = "Benjamin", Email = "brunquersb@helha.be" },
                new Enseignant { Id = 2, Nom = "Alary", Prenom = "Philippe", Email = "alaryp@helha.be" }
            );*/
        }
    }
}
