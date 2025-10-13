namespace Foot2site_V1.Modele
{
    public class Produit
    {
        public int Id { get; set; }
        public string nom_produit { get; set; }
        public string description_produit { get; set; }
        public double prix_unitaire_produit { get; set; }

        public List<Stock_produit> stocks { get; set; }

    }
}
