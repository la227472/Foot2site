namespace Foot2site_V1.Modele
{
    public class Commande
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public double prixTotal { get; set; }

        public Boolean Paye { get; set; }
        public int Id_UTILISATEUR { get; set; }

        public virtual User utilisateur { get; set; }
        public List<Ligne_Commande> lignes_Commande { get; set; }

    }
}
