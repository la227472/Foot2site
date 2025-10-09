namespace Foot2site_V1.Modele
{
    public class Produit
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public double prix { get; set; }

        public List<Stock_produit> stocks { get; set; }

    }
}
