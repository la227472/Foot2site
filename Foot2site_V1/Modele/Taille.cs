using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Foot2site_V1.Modele
{
    public class Taille
    {
        public int Id { get; set; }

        [Required]
        public string taille { get; set; }

        [JsonIgnore]
        public List<Stock_produit>? Stock_Produits_List { get; set; }

    }
}
