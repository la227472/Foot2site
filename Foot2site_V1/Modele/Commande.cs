using System.Text.Json.Serialization;

namespace Foot2site_V1.Modele
{
    public class Commande
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public double prixTotal { get; set; }

        public Boolean Paye { get; set; }
        public int Id_UTILISATEUR { get; set; }

        [JsonIgnore]
        public virtual User? utilisateur { get; set; }

        [JsonIgnore]
        public List<Ligne_Commande>? lignes_Commande { get; set; }

    }
}
