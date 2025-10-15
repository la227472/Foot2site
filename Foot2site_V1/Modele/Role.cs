using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Foot2site_V1.Modele
{
    public class Role
    {
        [Key]
        public int Id_Role { get; set; }
        public string NomRole { get; set; }


        // Relation avec les utilisateurs
        public List<User> User { get; set; }
     
    }
}
