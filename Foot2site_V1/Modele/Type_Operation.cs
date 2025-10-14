using System.ComponentModel.DataAnnotations;

namespace Foot2site_V1.Modele
{
    public class Type_Operation
    {
        [Key]
        public int Id_Type_Operation { get; set; }
        public string Nom_Type_Operation { get; set; } = " ";

        // Relation avec les transactions
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();

    }
}
