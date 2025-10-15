using System.ComponentModel.DataAnnotations;

namespace Foot2site_V1.Modele
{
    public class User
    {
        [Key]
        public int Id { get; set; } 
        public string Name { get; set; }

        public string Firstname { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }

        public string Adresse { get; set; }

        public double Credit { get; set; }

        public virtual List<Commande> commandes { get; set; }
        // Relation avec les transactions
        public List<Transaction> Transactions { get; set; } = new List<Transaction>(); 

    }
}
