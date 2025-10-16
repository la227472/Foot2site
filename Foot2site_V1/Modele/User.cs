using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Foot2site_V1.Modele
{
    public class User
    {
        [Key]
        public int Id_User { get; set; } 
        public string Name { get; set; }

        public string Firstname { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public string Adresse { get; set; }


        // Relation avec les commandes
        public virtual List<Commande> commandes { get; set; }
        // Relation avec les transactions
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();

        // Clé étrangère vers le rôle
        public int Id_Role { get; set; }
        // Relation avec le rôle
        public Role? Role { get; set; }
    }
}
