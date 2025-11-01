using Foot2site_V1.Modele;
using Microsoft.AspNetCore.Authentication;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Foot2site_V1.Services
{
    public class AuthorizationServices
    {
        // dans le cadre du projet nous ferons ainsi mais en production il faut stocker dans les variable environnement
        private string privateKey = "maClePriveApartirDeLaGeneartionSSHviaTerminal";

        // On passe en parametre les informations du user pour inclure les informations dans le token sans le mots de passe 
        public string CreateToken(User users)
        {
            // Ici on creer la signature du token
            var handler = new JwtSecurityTokenHandler();

            var privateKeyUTF8 = Encoding.UTF8.GetBytes(privateKey);

            var credentials = new SigningCredentials(new SymmetricSecurityKey(privateKeyUTF8), SecurityAlgorithms.HmacSha256);

            var tokenDescription = new SecurityTokenDescriptor
            {
                SigningCredentials = credentials,
                // On ajoute les informations que l'on veut dans le token
                Expires = DateTime.UtcNow.AddMinutes(5),
                Subject = generateClaims(users)
            };

            var tokenFinal = handler.CreateToken(tokenDescription);

            return handler.WriteToken(tokenFinal);
        }

        private ClaimsIdentity generateClaims(User users)
        {
            var claims = new ClaimsIdentity();
            // Claime obligatoire
            claims.AddClaim(new Claim(ClaimTypes.Name, users.Name));
            claims.AddClaim(new Claim(ClaimTypes.Email, users.Email));
            claims.AddClaim(new Claim("username", users.Firstname));
            claims.AddClaim(new Claim("id", users.Id_User.ToString()));

            foreach (var role in users.Role.NomRole)
            {
                claims.AddClaim(new Claim(ClaimTypes.Role, role.ToString()));
            }

            return claims;
        }

        public bool IsTokenValid(string token, string role)
        {
            token = token.Replace("Bearer", "").Trim();
            var handler = new JwtSecurityTokenHandler();
            var param = new TokenValidationParameters();
            param.ValidateIssuer = false;
            param.ValidateAudience = false;
            param.ValidateLifetime = true;
            param.IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(privateKey));

            SecurityToken securityToken;
            try
            {
                var claims = handler.ValidateToken(token, param, out securityToken);

                if (role != null)
                {
                    return claims.IsInRole(role);
                }
                else
                {
                    return true;
                }
            }
            catch (Exception e)
            {
                return false;
            }
        }
    }
}
