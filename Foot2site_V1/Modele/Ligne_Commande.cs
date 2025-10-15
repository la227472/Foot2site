namespace Foot2site_V1.Modele
{
    public class Ligne_Commande
    {
        public int Id { get; set; }
        public int quantite { get; set; }
        public double prixUnitaire { get; set; }
        // Clés étrangères explicites
        public int Id_COMMANDE { get; set; }
        public int Id_STOCK_PRODUIT { get; set; }
        public Commande commande { get; set; }
        public Stock_produit stock_Produit { get; set; }
    }
}
