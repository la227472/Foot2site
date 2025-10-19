using System.Text.Json.Serialization;

namespace Foot2site_V1.Modele
{
    public class Stock_produit
    {
        public int Id { get; set; }

        public int quantite { get; set; }

        // Clé étrangère vers Produit
        public int id_PRODUIT { get; set; }

        [JsonIgnore]
        public Produit? produit { get; set; }

        // Clé étrangère vers Taille
        public int id_TAILLE { get; set; }

        [JsonIgnore]
        public Taille? taille { get; set; }

        [JsonIgnore]
        public List<Ligne_Commande>? lignesCommande { get; set; }
    }
}
