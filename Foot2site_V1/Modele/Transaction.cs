using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Foot2site_V1.Modele
{
    public class Transaction
    {
        [Key]
        public int Id_Transaction { get; set; }
        public string Description_transaction { get; set; } = " ";
        [Column(TypeName = "decimal(10,2)")]

        public decimal Montant_operation { get; set; }

        // Clé étrangère vers User
        public int Id_User { get; set; }
        [JsonIgnore]
        public User? Utilisateur { get; set; }

        // Clé étrangère vers Type_Operation
        public int Id_TYPE_OPERATION { get; set; }
        [JsonIgnore]
        public Type_Operation? TypeOperation { get; set; }
    }
}