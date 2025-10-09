namespace Foot2site_V1.Modele
{
    public class Stock_produit
    {
        public int Id { get; set; }

        public int quantite { get; set; }

        public Produit produit { get; set; }

        public List <Taille> taille {  get; set; }
    }
}
